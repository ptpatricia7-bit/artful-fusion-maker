import { createServerFn } from "@tanstack/react-start";
import { requireAuthenticatedUser } from "@/lib/authenticated-server.middleware";

export const criarLinkQuiz = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedUser])
  .inputValidator((d: unknown) => {
    const x = d as { html?: unknown; titulo?: unknown };
    if (typeof x?.html !== "string" || x.html.length < 20 || x.html.length > 300000) throw new Error("Quiz inválido para compartilhar.");
    return { html: x.html, titulo: typeof x.titulo === "string" ? x.titulo.slice(0, 120) : "Quiz" };
  })
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("shared_quizzes")
      .insert({ user_id: context.userId, html: data.html, title: data.titulo }).select("id").single();
    if (error || !row) return { id: null, erro: "Não foi possível criar o link agora." };
    return { id: row.id, erro: null };
  });
