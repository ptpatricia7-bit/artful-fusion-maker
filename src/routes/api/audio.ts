import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/audio")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
        const url = process.env["SUPABASE_URL"];
        const publishable = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!token || !url || !publishable) return Response.json({ erro: "Entre novamente para continuar." }, { status: 401 });
        const client = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } });
        const { data, error } = await client.auth.getUser(token);
        if (error || !data.user) return Response.json({ erro: "Sua sessão expirou. Entre novamente." }, { status: 401 });
        try {
          const body = await request.json() as { texto?: string; voz?: string };
          if (typeof body.texto !== "string" || body.texto.trim().length < 3 || body.texto.length > 3000) return Response.json({ erro: "Digite de 3 a 3.000 caracteres." }, { status: 400 });
          const { pausedAiMessage, gatewayError } = await import("@/lib/ai-control.server");
          const paused = await pausedAiMessage();
          if (paused) return Response.json({ erro: paused }, { status: 402 });
          const apiKey = process.env["LOVABLE_API_KEY"];
          if (!apiKey) return Response.json({ erro: "A inteligência artificial não está configurada." }, { status: 503 });
          const { requestSpeech } = await import("@/lib/speech/speech-request.server");
          const upstream = await requestSpeech({ baseURL: "https://ai.gateway.lovable.dev", apiKey, model: "google/gemini-3.1-flash-tts-preview", format: "gemini", voice: body.voz === "Puck" ? "Puck" : "Kore" }, body.texto, true);
          if (!upstream.ok) return Response.json({ erro: await gatewayError(upstream) }, { status: upstream.status });
          return new Response(upstream.body, { headers: { "Content-Type": upstream.headers.get("content-type") || "audio/wav", "Cache-Control": "private, no-store" } });
        } catch {
          return Response.json({ erro: "Não foi possível gerar o áudio agora." }, { status: 500 });
        }
      },
    },
  },
});