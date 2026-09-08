import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar no T@arte" },
      {
        name: "description",
        content: "Acesse seu painel do T@arte para ver o ranking do TikTok Shop e o Estúdio.",
      },
      { property: "og:title", content: "Entrar no T@arte" },
      { property: "og:description", content: "Acesse o painel e o Estúdio do T@arte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const [enviado, setEnviado] = useState(false);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="aurora flex min-h-[70vh] items-center justify-center px-5 py-16">
        <div className="glass w-full max-w-md rounded-3xl p-8">
          <h1 className="font-display text-2xl font-bold">Entrar</h1>
          <p className="mt-2 text-[13.5px] text-muted-foreground">
            Use o e-mail da sua compra para acessar o painel.
          </p>
          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setEnviado(true);
            }}
          >
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="voce@email.com"
                className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="senha">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                required
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-neon py-3 text-sm font-semibold text-primary-foreground"
            >
              Entrar no painel
            </button>
          </form>
          {enviado && (
            <p className="mt-4 rounded-xl border border-primary/40 px-4 py-3 text-[13px] text-primary">
              O login de verdade ainda não está ligado. Enquanto isso, o painel está aberto pra
              você explorar.
            </p>
          )}
          <div className="mt-6 flex justify-between text-[13px] text-muted-foreground">
            <Link to="/painel">Ver o painel</Link>
            <Link to="/planos">Ainda não tenho acesso</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
