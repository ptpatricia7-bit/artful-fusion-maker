import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Ativa o acesso Indica Vizinho para o usuário logado: o servidor consulta os
// grants de compra no banco do marketplace e grava a assinatura permanente.
export const Route = createFileRoute("/api/indica-vizinho")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
        const url = process.env["SUPABASE_URL"];
        const publishable = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!token || !url || !publishable) {
          return Response.json({ erro: "Entre novamente para continuar." }, { status: 401 });
        }
        const client = createClient(url, publishable, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await client.auth.getUser(token);
        if (error || !data.user) {
          let host = "URL inválida";
          try {
            host = new URL(url).host;
          } catch {
            host = "URL inválida: " + JSON.stringify(url);
          }
          const keyKind = publishable?.startsWith("sb_publishable_")
            ? "chave nova"
            : `chave tipo ${publishable?.slice(0, 8)}…`;
          console.error(`[indica-vizinho] Token rejeitado. Servidor usa: ${host} / ${keyKind} / motivo: ${error?.message}`);
          return Response.json(
            { erro: `Servidor não validou a sessão (${host} / ${keyKind}): ${error?.message ?? "sem detalhes"}` },
            { status: 401 },
          );
        }
        const email = data.user.email ?? "";
        if (!email) {
          return Response.json({ erro: "Sua conta não possui e-mail definido." }, { status: 400 });
        }
        try {
          const { activateIndicaVizinhoPlan } = await import("@/lib/indica-vizinho.server");
          const result = await activateIndicaVizinhoPlan(data.user.id, email);
          return Response.json(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Não foi possível ativar agora.";
          console.error("[indica-vizinho] Falha na ativação:", message);
          const status = message.includes("não configurada") ? 503 : 500;
          return Response.json({ erro: message }, { status });
        }
      },
    },
  },
});
