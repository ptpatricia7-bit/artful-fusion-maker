import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { planos } from "@/lib/tarte-data";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos e preços — T@arte" },
      {
        name: "description",
        content:
          "Escolha entre mensal, trimestral ou anual e libere o painel do TikTok Shop BR, o Multiplicador de Vídeos e os roteiros com IA.",
      },
      { property: "og:title", content: "Planos e preços — T@arte" },
      {
        property: "og:description",
        content: "Acesso completo ao painel e ao Multiplicador de Vídeos. 7 dias de garantia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Planos,
});

function Planos() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="aurora border-b border-border py-16">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <h1 className="font-display text-4xl font-bold">Escolha seu acesso</h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-muted-foreground">
            Todos os planos incluem o Multiplicador de Vídeos e o ranking diário do TikTok Shop
            Brasil. 7 dias de garantia com reembolso de 100%.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 lg:grid-cols-3">
          {planos.map((p) => (
            <div
              key={p.nome}
              className={`glass relative flex flex-col rounded-3xl p-7 ${
                p.destaque ? "glow border-primary/40" : ""
              }`}
            >
              {p.destaque && (
                <span className="absolute -top-3 left-7 rounded-full bg-gradient-neon px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Mais escolhido
                </span>
              )}
              <h2 className="font-display text-lg font-semibold">{p.nome}</h2>
              <p className="mt-3">
                <span className="font-display text-4xl font-bold">{p.preco}</span>
                <span className="text-sm text-muted-foreground">{p.ciclo}</span>
              </p>
              <p className="mt-2 text-[13.5px] text-muted-foreground">{p.resumo}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.itens.map((i) => (
                  <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {i}
                  </li>
                ))}
              </ul>
              <Link
                to="/entrar"
                className={`mt-7 rounded-full py-3 text-center text-sm font-semibold ${
                  p.destaque
                    ? "bg-gradient-neon text-primary-foreground"
                    : "border border-border text-foreground"
                }`}
              >
                Garantir acesso
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-[13px] text-muted-foreground">
          Pagamento único por ciclo · cancele quando quiser
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
