import { createFileRoute } from "@tanstack/react-router";

// Webhook da Cakto: recebe avisos de venda e ativa/cancela assinaturas.
// Segurança: assinatura HMAC-SHA256 (X-Cakto-Signature) ou campo `secret` no corpo,
// ambos comparados com CAKTO_WEBHOOK_SECRET. Nunca retorna dados pessoais.

const PLAN_BY_PRODUCT_ID: Record<string, number> = {
  "a9702c53-bf93-4d3e-ad9e-c3f8d0228781": 3700, // Mensal R$ 37
  "aa27e750-89a2-4f4c-b5fb-235651a94e18": 9700, // Trimestral R$ 97
  "c643f676-1601-4371-a8a1-d30bfb29a76d": 69800, // Anual R$ 698
};

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function pick(obj: unknown, paths: string[][]): string | undefined {
  for (const path of paths) {
    let cur: unknown = obj;
    for (const key of path) {
      if (cur == null || typeof cur !== "object") { cur = undefined; break; }
      cur = (cur as Record<string, unknown>)[key];
    }
    if (typeof cur === "string" && cur.trim()) return cur.trim();
  }
  return undefined;
}

function pickNumber(obj: unknown, paths: string[][]): number | undefined {
  const v = pick(obj, paths);
  if (v == null) return undefined;
  const n = Number(String(v).replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : undefined;
}

export const Route = createFileRoute("/api/public/cakto-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CAKTO_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook não configurado.", { status: 503 });

        const rawBody = await request.text();

        // Verificação do remetente: assinatura HMAC ou campo secret no corpo.
        const signatureHeader = request.headers.get("x-cakto-signature") ?? "";
        const timestamp = request.headers.get("x-cakto-timestamp");
        if (timestamp) {
          const ts = Number(timestamp);
          if (Number.isFinite(ts) && Math.abs(Date.now() / 1000 - ts) > 300) {
            // Responde 200 sem processar, para a Cakto não bloquear o salvamento.
            return Response.json({ ok: true });
          }
        }

        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(rawBody) as Record<string, unknown>;
        } catch {
          // Teste de conexão sem corpo JSON: confirma recebimento sem processar nada.
          return Response.json({ ok: true });
        }

        let verified = false;
        const sigMatch = signatureHeader.match(/^v1=([0-9a-f]{64})$/i);
        if (sigMatch && sigMatch[1]) {
          const expected = await hmacSha256Hex(secret, rawBody);
          verified = timingSafeEqual(expected, sigMatch[1].toLowerCase());
        }
        if (!verified && typeof payload["secret"] === "string") {
          verified = timingSafeEqual(payload["secret"] as string, secret);
        }
        if (!verified) {
          // Avisos sem assinatura válida são ignorados (nada é gravado nem liberado),
          // mas respondemos 200 para o teste de "Salvar" da Cakto não falhar.
          console.warn("[cakto-webhook] aviso ignorado: assinatura não confere");
          return Response.json({ ok: true });
        }

        const event = String(payload["event"] ?? "desconhecido");
        const data = (payload["data"] ?? payload) as Record<string, unknown>;
        const email = pick(data, [
          ["customer", "email"], ["customer_email"], ["email"], ["buyer", "email"], ["client", "email"],
        ])?.toLowerCase();
        const orderId = pick(data, [["id"], ["order_id"], ["orderId"], ["transaction_id"], ["refId"]]);
        const productId = pick(data, [["product", "id"], ["product_id"], ["productId"], ["offer", "id"]]);
        const productName = pick(data, [["product", "name"], ["product_name"], ["productName"], ["offer", "name"]]);
        const paymentMethod = pick(data, [["payment_method"], ["paymentMethod"], ["payment", "method"]]);
        const amountCents = pickNumber(data, [["amount"], ["total"], ["value"], ["price"]]);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: inserted, error: insertError } = await supabaseAdmin
          .from("cakto_events")
          .insert({
            event,
            provider_order_id: orderId ?? null,
            customer_email: email ?? null,
            amount_cents: amountCents ?? null,
            payment_method: paymentMethod ?? null,
            product_id: productId ?? null,
            product_name: productName ?? null,
            payload: JSON.parse(rawBody),
          })
          .select("id")
          .single();
        if (insertError) {
          console.error("[cakto-webhook] falha ao registrar evento", insertError.message);
          return new Response("Erro interno.", { status: 500 });
        }

        const approved = /approved|aprovad|paid|pago|confirmed|confirmad/i.test(event);
        const revoked = /refund|reembols|chargeback|estorno|cancel|expired|expirad/i.test(event);

        let processed = false;
        if ((approved || revoked) && email) {
          try {
            processed = await applySubscriptionChange({
              email, productId, productName, amountCents, orderId, activate: approved,
            });
          } catch (err) {
            console.error("[cakto-webhook] falha ao aplicar assinatura", err);
          }
        }

        if (processed && inserted?.id) {
          await supabaseAdmin.from("cakto_events").update({ processed: true }).eq("id", inserted.id);
        }

        return Response.json({ ok: true });
      },
    },
  },
});

async function applySubscriptionChange(args: {
  email: string;
  productId?: string | undefined;
  productName?: string | undefined;
  amountCents?: number | undefined;
  orderId?: string | undefined;
  activate: boolean;
}): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Localiza o usuário pelo e-mail da compra.
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersError) throw usersError;
  const user = usersData.users.find((u) => u.email?.toLowerCase() === args.email);
  if (!user) return false; // comprador ainda não criou conta; evento fica registrado

  // Identifica o plano pelo produto da Cakto (id → preço) ou pelo valor pago.
  const priceCents = (args.productId && PLAN_BY_PRODUCT_ID[args.productId]) || args.amountCents;
  let planId: string | undefined;
  let billingMonths = 1;
  if (priceCents) {
    const { data: plan } = await supabaseAdmin
      .from("subscription_plans")
      .select("id, billing_months")
      .eq("price_cents", priceCents)
      .eq("active", true)
      .limit(1)
      .maybeSingle();
    if (plan) { planId = plan.id; billingMonths = plan.billing_months; }
  }

  const { data: existing } = await supabaseAdmin
    .from("user_subscriptions")
    .select("id, plan_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!args.activate) {
    if (!existing) return true;
    const { error } = await supabaseAdmin
      .from("user_subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw error;
    return true;
  }

  if (!planId) {
    // Plano não identificado: mantém o plano atual, se houver.
    planId = existing?.plan_id;
    if (!planId) return false;
  }

  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + billingMonths);

  const row = {
    plan_id: planId,
    status: "active",
    provider: "cakto",
    provider_subscription_id: args.orderId ?? null,
    current_period_start: now.toISOString(),
    current_period_end: end.toISOString(),
    updated_at: now.toISOString(),
  };

  if (existing) {
    const { error } = await supabaseAdmin.from("user_subscriptions").update(row).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin.from("user_subscriptions").insert({ ...row, user_id: user.id });
    if (error) throw error;
  }
  return true;
}
