import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/public/quiz/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const notFound = () => new Response("Quiz não encontrado.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
        if (!/^[0-9a-f-]{36}$/i.test(params.id)) return notFound();
        const url = process.env["SUPABASE_URL"]; const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) return notFound();
        const client = createClient(url, key, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          global: { fetch: (i, init) => { const h = new Headers(init?.headers); if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(i, { ...init, headers: h }); } },
        });
        const { data, error } = await client.rpc("get_shared_quiz", { _id: params.id });
        if (error || typeof data !== "string") return notFound();
        return new Response(data, { headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy": "sandbox allow-scripts; default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:",
          "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=300",
        } });
      },
    },
  },
});
