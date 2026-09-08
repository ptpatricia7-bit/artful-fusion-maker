import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { faq } from "@/lib/tarte-data";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Perguntas frequentes — T@arte" },
      {
        name: "description",
        content:
          "Como funciona o Multiplicador de Vídeos, a etiqueta de originalidade, a atualização dos dados e a garantia de 7 dias.",
      },
      { property: "og:title", content: "Perguntas frequentes — T@arte" },
      {
        property: "og:description",
        content: "Tudo sobre o painel do TikTok Shop BR e o Multiplicador de Vídeos do T@arte.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="aurora border-b border-border py-16">
        <div className="mx-auto max-w-3xl px-5">
          <h1 className="font-display text-4xl font-bold">Perguntas frequentes</h1>
          <p className="mt-4 text-[15px] text-muted-foreground">
            Se ficar qualquer dúvida, o suporte responde dentro do painel.
          </p>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto max-w-3xl space-y-3 px-5">
          {faq.map((f) => (
            <details key={f.q} className="glass rounded-xl px-5 py-4">
              <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
          <div className="pt-8 text-center">
            <Link
              to="/planos"
              className="glow inline-block rounded-full bg-gradient-neon px-7 py-3.5 text-sm font-semibold text-primary-foreground"
            >
              Ver os planos
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
