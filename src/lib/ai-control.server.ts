import { supabaseAdmin } from "@/integrations/supabase/client.server";

type GatewayErrorBody = {
  message?: string;
  type?: string;
  error?: { message?: string; type?: string };
  props?: { retryable?: boolean; requires?: string };
};

const ROW_ID = 1;

function displayMessage(message: string) {
  return message === "Not enough credits"
    ? "Not enough credits — Os créditos de inteligência artificial acabaram. Adicione créditos para continuar."
    : message;
}

export async function pausedAiMessage(): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("ai_gateway_control")
    .select("paused_message")
    .eq("id", ROW_ID)
    .maybeSingle();
  if (error) throw new Error("Não foi possível verificar a disponibilidade da inteligência artificial.");
  return data?.paused_message ? displayMessage(data.paused_message) : null;
}

export async function gatewayError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as GatewayErrorBody | null;
  const message = body?.message || body?.error?.message ||
    (res.status === 402
      ? "Os créditos de inteligência artificial acabaram. Adicione créditos para continuar."
      : res.status === 429
        ? "Muitos pedidos ao mesmo tempo. Aguarde antes de tentar novamente."
        : "A inteligência artificial não respondeu agora.");
  const type = body?.type || body?.error?.type || "";
  const workspaceBlock = res.status === 403 && (
    type === "credit_limit_reached" || body?.props?.requires === "top_up" ||
    (body?.props?.requires === "admin_action" && type !== "provider_not_available_in_region" && type !== "model_requires_retention_consent")
  );
  const providerDenial = res.status === 403 && !workspaceBlock &&
    type !== "provider_not_available_in_region" && type !== "model_requires_retention_consent";

  if (res.status === 402 || workspaceBlock || providerDenial) {
    const { error } = await supabaseAdmin.from("ai_gateway_control").upsert({
      id: ROW_ID,
      paused_reason: providerDenial ? "provider_denied" : "workspace_blocked",
      paused_message: message,
      paused_at: new Date().toISOString(),
    });
    if (error) console.error("Failed to persist AI pause state", error);
  }
  return displayMessage(message);
}