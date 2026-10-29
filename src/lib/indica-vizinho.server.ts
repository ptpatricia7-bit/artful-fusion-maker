// Integração Indica Vizinho: verifica grants de compra no banco do marketplace
// e ativa a assinatura permanente do plano "Indica Vizinho" no T@arte.
// Server-only. A verificação usa uma RPC protegida por segredo compartilhado
// (IV_SHARED_SECRET) — a tabela de grants não é exposta publicamente.
import { createClient } from "@supabase/supabase-js";

function createIvClient() {
  const url = process.env["IV_SUPABASE_URL"];
  const key = process.env["IV_SUPABASE_ANON_KEY"];
  if (!url || !key) {
    throw new Error("Integração Indica Vizinho não configurada (IV_SUPABASE_URL / IV_SUPABASE_ANON_KEY).");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

export async function hasIndicaVizinhoGrant(email: string): Promise<boolean> {
  const iv = createIvClient();
  const secret = process.env["IV_SHARED_SECRET"];
  if (!secret) {
    throw new Error("Integração Indica Vizinho não configurada (IV_SHARED_SECRET).");
  }
  const { data, error } = await iv.rpc("iv_check_grant", {
    p_email: email.toLowerCase(),
    p_secret: secret,
  });
  if (error) {
    let ivHost = "URL inválida";
    try {
      ivHost = new URL(url).host + new URL(url).pathname;
    } catch {
      ivHost = JSON.stringify(url);
    }
    throw new Error("Falha na consulta Indica Vizinho (" + ivHost + "): " + (error.message ?? JSON.stringify(error)));
  }
  return data === true;
}

export async function activateIndicaVizinhoPlan(
  userId: string,
  email: string,
): Promise<{ ativado: boolean }> {
  const hasGrant = await hasIndicaVizinhoGrant(email);
  if (!hasGrant) return { ativado: false };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const code = "indica-vizinho";
  const { data: existingPlan } = await supabaseAdmin
    .from("subscription_plans")
    .select("id")
    .eq("code", code)
    .maybeSingle();
  let planId: string | undefined = existingPlan?.id;
  if (!planId) {
    const { data: created, error: planError } = await supabaseAdmin
      .from("subscription_plans")
      .insert({ code, name: "Indica Vizinho", price_cents: 0, billing_months: 1, active: true })
      .select("id")
      .single();
    if (planError || !created) {
      throw new Error("Falha ao preparar o plano Indica Vizinho: " + (planError?.message ?? "resposta vazia"));
    }
    planId = created.id;
  }

  // Assinatura permanente: sem current_period_end (válido pelo CHECK da tabela).
  const { error: subError } = await supabaseAdmin.from("user_subscriptions").upsert(
    {
      user_id: userId,
      plan_id: planId,
      status: "active",
      provider: "indica-vizinho",
      provider_subscription_id: userId,
      current_period_start: new Date().toISOString(),
      current_period_end: null,
    },
    { onConflict: "provider,provider_subscription_id" },
  );
  if (subError) {
    throw new Error("Falha ao ativar a assinatura Indica Vizinho: " + subError.message);
  }
  return { ativado: true };
}
