import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { produtos, videosVirais, nichos, brl } from "@/lib/tarte-data";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos e os vídeos que vendem eles — T@arte" },
      {
        name: "description",
        content:
          "Cada produto do TikTok Shop BR com faturamento, comissão e os vídeos virais que vendem ele.",
      },
      { property: "og:title", content: "Produtos e vídeos virais — T@arte" },
      {
        property: "og:description",
        content: "Escolha um produto e veja os vídeos que estão faturando com ele.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Produtos,
});

function Produtos() {
  const [selecionado, setSelecionado] = useState(produtos[0]!.id);
  const [nicho, setNicho] = useState("Todos");
  const [busca, setBusca] = useState("");

  const lista = useMemo(
    () =>
      produtos
        .filter((p) => (nicho === "Todos" ? true : p.nicho === nicho))
        .filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()))
        .sort((a, b) => b.faturamento - a.faturamento),
    [nicho, busca],
  );

  const p = produtos.find((x) => x.id === selecionado) ?? lista[0];

  const videosDoProduto = videosVirais.filter(
    (v) =>
      p &&
      (v.produto.toLowerCase().includes(p.nome.split(" ")[0]!.toLowerCase()) ||
        p.nome.toLowerCase().includes(v.produto.split(" ")[0]!.toLowerCase())),
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Produtos e vídeos</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Toque num produto para ver os vídeos virais que estão vendendo ele.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto…"
            className="w-full max-w-xs rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
            className="rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {nichos.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-3 sm:grid-cols-2">
            {lista.map((x) => (
              <button
                key={x.id}
                onClick={() => setSelecionado(x.id)}
                className={`glass rounded-2xl p-5 text-left transition-colors ${
                  p?.id === x.id ? "glow border-primary/40" : ""
                }`}
              >
                <p className="font-medium">{x.nome}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {x.nicho} · R$ {x.preco.toFixed(2).replace(".", ",")}
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <p className="font-display text-xl font-bold text-primary">
                    {brl(x.faturamento)}
                  </p>
                  <p className="text-xs text-accent">+{x.crescimento}%</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {x.vendas.toLocaleString("pt-BR")} vendas · comissão {x.comissao}%
                </p>
              </button>
            ))}
            {lista.length === 0 && (
              <p className="col-span-2 py-8 text-center text-muted-foreground">
                Nenhum produto com esse filtro.
              </p>
            )}
          </div>

          <div className="glass h-fit rounded-2xl p-5">
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              Vídeos vendendo {p ? `“${p.nome}”` : "este produto"}
            </p>
            {p && (
              <div className="mt-3 rounded-xl bg-secondary/50 p-4 text-[13px] text-muted-foreground">
                Faturamento {brl(p.faturamento)} · {p.criadores} criadores postando · comissão de{" "}
                {p.comissao}% por venda
              </div>
            )}
            <div className="mt-4 space-y-3">
              {videosDoProduto.length > 0 ? (
                videosDoProduto.map((v) => (
                  <div key={v.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-primary">{v.views}</span>
                      <span className="text-xs text-muted-foreground">eng. {v.engajamento}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{v.criador}</p>
                    <p className="mt-2 text-[13px] font-medium">“{v.gancho}”</p>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-muted-foreground">
                  Ainda não ligamos vídeos virais a este produto. Veja a aba de tendências no
                  painel.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
