import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { criadores, brl } from "@/lib/tarte-data";

export const Route = createFileRoute("/criadores")({
  head: () => ({
    meta: [
      { title: "Criadores e lojas que mais faturam no TikTok Shop BR — T@arte" },
      {
        name: "description",
        content:
          "Ranking de criadores e lojas que mais faturam no TikTok Shop Brasil, com seguidores, nicho e volume de vídeos.",
      },
      { property: "og:title", content: "Criadores que mais faturam — T@arte" },
      {
        property: "og:description",
        content: "Encontre criadores vencedores no seu nicho e veja o que eles postam.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Criadores,
});

function Criadores() {
  const [busca, setBusca] = useState("");
  const [nicho, setNicho] = useState("Todos");

  const nichosDisp = useMemo(
    () => ["Todos", ...Array.from(new Set(criadores.map((c) => c.nicho)))],
    [],
  );

  const lista = criadores
    .filter((c) => (nicho === "Todos" ? true : c.nicho === nicho))
    .filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => b.faturamento - a.faturamento);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Criadores e lojas</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Quem mais fatura no TikTok Shop Brasil — pra você se espelhar ou convidar pra divulgar
          seus produtos.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar criador…"
            className="w-full max-w-xs rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
            className="rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {nichosDisp.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((c, i) => (
            <div key={c.nome} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-neon font-display font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{c.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.nicho} · {c.seguidores} seguidores
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Faturamento no período</p>
                  <p className="font-display text-xl font-bold text-primary">
                    {brl(c.faturamento)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{c.videos} vídeos</p>
              </div>
            </div>
          ))}
          {lista.length === 0 && (
            <p className="py-8 text-center text-muted-foreground md:col-span-2 lg:col-span-3">
              Nenhum criador com esse filtro.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
