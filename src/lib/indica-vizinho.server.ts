// Integração Indica Vizinho: verifica grants de compra no banco do marketplace
// e ativa a assinatura permanente do plano "Indica Vizinho" no T@arte.
// Server-only: usa a chave service_role do Supabase da Indica Vizinho, que fica
// apenas nos secrets do servidor (IV_SUPABASE_URL / IV_SUPABASE_SERVICE_ROLE_KEY).
import { createClient } from "@supabase/supabase-js";

function createIvClient() {
  const url = process.env["IV_SUPABASE_URL"];
  const key = process.env["IV_SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) {
    throw new Error("Integração Indica Vizinho não configurada (IV_SUPABASE_URL / IV_SUPABASE_SERVICE_ROLE_KEY).");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

export interface IvGrant {
  grant_type: string;
  item_id: string;
  granted_at: string;
}

export async function listGrantsForEmail(email: string): Promise<IvGrant[]> {
  const iv = createIvClient();
  const { data, error } = await iv
    .from("tool_access_grants")
    .select("grant_type,item_id,granted_at")
    .eq("email", email.toLowerCase());
  if (error) {
    throw new Error("Não foi possível consultar o acesso Indica Vizinho agora.");
  }
  return data ?? [];
}

export async function activateIndicaVizinhoPlan(
  userId: string,
  email: string,
): Promise<{ ativado: boolean; ferramentas?: number }> {
  const grants = await listGrantsForEmail(email);
  if (grants.length === 0) return { ativado: false };

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
      throw new Error("Não foi possível preparar o plano Indica Vizinho.");
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
    throw new Error("Não foi possível ativar a assinatura Indica Vizinho.");
  }
  return { ativado: true, ferramentas: grants.length };
}
