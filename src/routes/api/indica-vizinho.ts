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
          return Response.json({ erro: "Sua sessão expirou. Entre novamente." }, { status: 401 });
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
