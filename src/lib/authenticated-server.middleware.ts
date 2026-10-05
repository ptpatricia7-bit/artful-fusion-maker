import { createClient } from "@supabase/supabase-js";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";

function createAuthenticatedFetch(apiKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (apiKey.startsWith("sb_") && headers.get("Authorization") === `Bearer ${apiKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", apiKey);
    return fetch(input, { ...init, headers });
  };
}

export const requireAuthenticatedUser = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const url = process.env["SUPABASE_URL"];
    const apiKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !apiKey) {
      throw new Error("A autenticação não está configurada.");
    }

    const authHeader = getRequest()?.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) {
      throw new Error("Sua sessão terminou. Entre novamente para continuar.");
    }

    const supabase = createClient<Database>(url, apiKey, {
      global: {
        fetch: createAuthenticatedFetch(apiKey),
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new Error("Sua sessão expirou. Saia e entre novamente para continuar.");
    }

    return next({
      context: {
        supabase,
        userId: data.user.id,
        claims: { sub: data.user.id },
      },
    });
  },
);