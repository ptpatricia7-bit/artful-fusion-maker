import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { produtos, nichos, periodos, videosVirais, criadores, brl } from "@/lib/tarte-data";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel de produtos e vídeos do TikTok Shop BR — T@arte" },
      {
        name: "description",
        content:
          "Ranking diário de faturamento, vendas e crescimento dos produtos do TikTok Shop Brasil, com vídeos virais e criadores que mais faturam.",
      },
      { property: "og:title", content: "Painel do TikTok Shop BR — T@arte" },
      {
        property: "og:description",
        content: "Ranking por período real, filtros por nicho e os vídeos que estão bombando.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Painel,
});

type Aba = "produtos" | "videos" | "criadores" | "tendencias";

const abas: { id: Aba; label: string }[] = [
  { id: "produtos", label: "TOP produtos" },
  { id: "videos", label: "Vídeos virais" },
  { id: "criadores", label: "Criadores e lojas" },
  { id: "tendencias", label: "Tendências 24h" },
];

const tendenciaEstilo: Record<string, string> = {
  explodindo: "text-accent",
  subindo: "text-primary",
  estavel: "text-muted-foreground",
};

function Painel() {
  const [aba, setAba] = useState<Aba>("produtos");
  const [nicho, setNicho] = useState("Todos");
  const [periodo, setPeriodo] = useState("24 horas");
  const [busca, setBusca] = useState("");
  const [minFat, setMinFat] = useState(0);
  const [ordem, setOrdem] = useState<"faturamento" | "vendas" | "crescimento">("faturamento");

  const lista = useMemo(
    () =>
      produtos
        .filter((p) => (nicho === "Todos" ? true : p.nicho === nicho))
        .filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()))
        .filter((p) => p.faturamento >= minFat)
        .sort((a, b) => b[ordem] - a[ordem]),
    [nicho, busca, minFat, ordem],
  );

  const totalFat = lista.reduce((s, p) => s + p.faturamento, 0);
  const totalVendas = lista.reduce((s, p) => s + p.vendas, 0);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Painel T@arte</h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Dados do TikTok Shop Brasil · atualizado hoje às 04:12 · período: {periodo}
            </p>
          </div>
          <Link
            to="/estudio"
            className="rounded-full bg-gradient-neon px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Multiplicar vídeos
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="glass rounded-2xl p-5">
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              Faturamento filtrado
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-primary">{brl(totalFat)}</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-xs tracking-widest text-muted-foreground uppercase">Vendas</p>
            <p className="mt-1 font-display text-2xl font-bold">
              {totalVendas.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              Produtos no filtro
            </p>
            <p className="mt-1 font-display text-2xl font-bold">{lista.length}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {abas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                aba === a.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {aba === "produtos" && (
          <>
            <div className="glass mt-4 grid gap-4 rounded-2xl p-5 md:grid-cols-4">
              <div>
                <label className="text-xs text-muted-foreground">Buscar produto</label>
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="ex: sérum"
                  className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Nicho</label>
                <select
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {nichos.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Período</label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {periodos.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Ordenar por</label>
                <select
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value as typeof ordem)}
                  className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="faturamento">Faturamento</option>
                  <option value="vendas">Vendas</option>
                  <option value="crescimento">Crescimento</option>
                </select>
              </div>
              <div className="md:col-span-4">
                <label className="text-xs text-muted-foreground">
                  Faturamento mínimo: {brl(minFat)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1000000}
                  step={50000}
                  value={minFat}
                  onChange={(e) => setMinFat(Number(e.target.value))}
                  className="mt-2 w-full accent-[oklch(0.86_0.14_191)]"
                />
              </div>
            </div>

            <div className="glass mt-4 overflow-x-auto rounded-2xl">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-xs tracking-widest text-muted-foreground uppercase">
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Produto</th>
                    <th className="px-5 py-3">Faturamento</th>
                    <th className="px-5 py-3">Vendas</th>
                    <th className="px-5 py-3">Cresc.</th>
                    <th className="px-5 py-3">Comissão</th>
                    <th className="px-5 py-3">Criadores</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((p, i) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium">{p.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.nicho} · R$ {p.preco.toFixed(2).replace(".", ",")} ·{" "}
                          <span className={tendenciaEstilo[p.tendencia]}>{p.tendencia}</span>
                        </p>
                      </td>
                      <td className="px-5 py-3 font-semibold text-primary">{brl(p.faturamento)}</td>
                      <td className="px-5 py-3">{p.vendas.toLocaleString("pt-BR")}</td>
                      <td className="px-5 py-3 text-accent">+{p.crescimento}%</td>
                      <td className="px-5 py-3">{p.comissao}%</td>
                      <td className="px-5 py-3">{p.criadores}</td>
                    </tr>
                  ))}
                  {lista.length === 0 && (
                    <tr className="border-t border-border">
                      <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                        Nenhum produto com esses filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {aba === "videos" && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {videosVirais.map((v) => (
              <div key={v.id} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl font-bold text-primary">{v.views}</p>
                  <span className="text-xs text-muted-foreground">eng. {v.engajamento}</span>
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">{v.criador}</p>
                <p className="mt-3 text-sm font-medium">“{v.gancho}”</p>
                <p className="mt-2 text-[13px] text-muted-foreground">Produto: {v.produto}</p>
              </div>
            ))}
          </div>
        )}

        {aba === "criadores" && (
          <div className="glass mt-4 overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs tracking-widest text-muted-foreground uppercase">
                  <th className="px-5 py-3">Criador</th>
                  <th className="px-5 py-3">Nicho</th>
                  <th className="px-5 py-3">Seguidores</th>
                  <th className="px-5 py-3">Faturamento</th>
                  <th className="px-5 py-3">Vídeos</th>
                </tr>
              </thead>
              <tbody>
                {criadores.map((c) => (
                  <tr key={c.nome} className="border-t border-border">
                    <td className="px-5 py-3 font-medium">{c.nome}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.nicho}</td>
                    <td className="px-5 py-3">{c.seguidores}</td>
                    <td className="px-5 py-3 font-semibold text-primary">{brl(c.faturamento)}</td>
                    <td className="px-5 py-3">{c.videos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {aba === "tendencias" && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {produtos
              .filter((p) => p.tendencia === "explodindo")
              .map((p) => (
                <div key={p.id} className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{p.nome}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.nicho} · {p.criadores} criadores postando
                      </p>
                    </div>
                    <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                      +{p.crescimento}% em 24h
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-gradient-neon"
                      style={{ width: `${Math.min(100, p.crescimento / 3.2)}%` }}
                    />
                  </div>
                  <p className="mt-3 text-[13px] text-muted-foreground">
                    Faturou {brl(p.faturamento)} no período · comissão de {p.comissao}%
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
