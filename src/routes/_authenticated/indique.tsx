import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/_authenticated/indique")({
  head: () => ({
    meta: [
      { title: "Indique e ganhe — T@arte" },
      {
        name: "description",
        content:
          "Compartilhe seu link do T@arte e ganhe meses grátis e bônus a cada amigo que entrar.",
      },
      { property: "og:title", content: "Indique e ganhe — T@arte" },
      {
        property: "og:description",
        content: "A cada amigo que assina pelo seu link, você ganha prêmios e meses grátis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Indique,
});

const niveis = [
  { n: 1, amigos: 1, premio: "1 mês grátis" },
  { n: 2, amigos: 3, premio: "2 meses grátis + Cofre de Prompts completo" },
  { n: 3, amigos: 5, premio: "6 meses grátis" },
  { n: 4, amigos: 10, premio: "1 ano grátis + mentorias do time" },
];

function Indique() {
  const [copiado, setCopiado] = useState(false);
  const [amigos] = useState(2);
  const link = "https://tarte.app/r/tereza123";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <div className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Indique e ganhe</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] text-muted-foreground">
          Compartilhe seu link do T@arte. A cada amigo que assinar, você sobe de nível e acumula
          meses grátis.
        </p>

        <div className="glass mt-6 rounded-3xl p-6">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Seu link</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <code className="flex-1 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm break-all">
              {link}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(link);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1800);
              }}
              className="rounded-full bg-gradient-neon px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              {copiado ? "Copiado!" : "Copiar link"}
            </button>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            {amigos} amigos já entraram pelo seu link.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {niveis.map((nv) => {
            const atingido = amigos >= nv.amigos;
            const proximo = !atingido && (niveis.find((x) => x.amigos > amigos)?.amigos === nv.amigos);
            return (
              <div
                key={nv.n}
                className={`glass flex items-center justify-between rounded-2xl px-5 py-4 ${
                  atingido ? "border-primary/40" : ""
                }`}
              >
                <div>
                  <p className="font-semibold">
                    Nível {nv.n} · {nv.amigos} {nv.amigos === 1 ? "amigo" : "amigos"}
                  </p>
                  <p className="text-[13px] text-muted-foreground">{nv.premio}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    atingido
                      ? "bg-primary/15 text-primary"
                      : proximo
                        ? "bg-gold/15 text-gold"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {atingido ? "Liberado" : proximo ? "Quase lá" : "Bloqueado"}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-8 rounded-2xl border border-border p-4 text-center text-[13px] text-muted-foreground">
          O contador de indicações e os prêmios ficam reais quando o login for ligado.
        </p>
      </div>
    </div>
  );
}
