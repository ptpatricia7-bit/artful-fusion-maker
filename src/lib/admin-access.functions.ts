import { createServerFn } from "@tanstack/react-start";
import { requireAuthenticatedUser } from "@/lib/authenticated-server.middleware";

// Libera ou cancela manualmente o acesso de um comprador (pagamento via Pix confirmado pela admin).
export const liberarAcessoManual = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedUser])
  .inputValidator((d: unknown) => {
    const x = d as { email?: unknown; planId?: unknown; ativar?: unknown };
    const email = typeof x?.email === "string" ? x.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) throw new Error("E-mail inválido.");
    const planId = typeof x?.planId === "string" ? x.planId : "";
    if (x?.ativar !== false && !/^[0-9a-f-]{36}$/i.test(planId)) throw new Error("Escolha um plano.");
    return { email, planId, ativar: x?.ativar !== false };
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return { ok: false, msg: "Só administradores podem liberar acesso." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let user: { id: string } | undefined;
    for (let page = 1; page <= 20 && !user; page++) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return { ok: false, msg: "Não foi possível procurar a conta agora." };
      user = list.users.find((u) => u.email?.toLowerCase() === data.email);
      if (list.users.length < 1000) break;
    }
    if (!user) return { ok: false, msg: "Nenhuma conta com esse e-mail. Peça para a pessoa criar a conta no T@arte com esse e-mail." };

    const { data: existing } = await supabaseAdmin.from("user_subscriptions").select("id")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();

    if (!data.ativar) {
      if (existing) await supabaseAdmin.from("user_subscriptions").update({ status: "canceled" }).eq("id", existing.id);
      return { ok: true, msg: "Acesso cancelado." };
    }

    const { data: plan } = await supabaseAdmin.from("subscription_plans").select("id, billing_months, name").eq("id", data.planId).maybeSingle();
    if (!plan) return { ok: false, msg: "Plano não encontrado." };
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + plan.billing_months);
    const row = {
      plan_id: plan.id, status: "active", provider: "pix_manual", provider_subscription_id: null,
      current_period_start: now.toISOString(), current_period_end: end.toISOString(),
    };
    const { error } = existing
      ? await supabaseAdmin.from("user_subscriptions").update(row).eq("id", existing.id)
      : await supabaseAdmin.from("user_subscriptions").insert({ ...row, user_id: user.id });
    if (error) return { ok: false, msg: "Não foi possível liberar agora." };
    return { ok: true, msg: `Acesso ${plan.name} liberado até ${end.toLocaleDateString("pt-BR")}.` };
  });
