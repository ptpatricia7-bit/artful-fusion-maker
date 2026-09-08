import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { produtos } from "@/lib/tarte-data";

export const Route = createFileRoute("/estudio")({
  head: () => ({
    meta: [
      { title: "Estúdio: Multiplicador de Vídeos e roteiros com IA — T@arte" },
      {
        name: "description",
        content:
          "Monte até 150 vídeos combinando ganchos, corpos e CTAs, com etiqueta de originalidade e a ordem certa de postar.",
      },
      { property: "og:title", content: "Estúdio T@arte — Multiplicador de Vídeos" },
      {
        property: "og:description",
        content: "18 gravações viram 150 vídeos prontos, com etiqueta de originalidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Estudio,
});

const ganchosPadrao = [
  "Ninguém acredita que isso custa tão pouco",
  "Testei por 7 dias e olha o resultado",
  "Para tudo: eu achei o produto do ano",
  "O erro que todo mundo comete com isso",
  "Comprei sem esperança e me surpreendi",
  "Isso aqui esgotou 3 vezes esse mês",
  "Se você tem esse problema, assiste até o fim",
  "Minha rotina mudou por causa disso",
  "Antes e depois de 14 dias usando",
  "Eu não pagaria mais caro depois de saber isso",
];

const corposPadrao = [
  "Mostro o produto de perto, textura e tamanho real",
  "Explico como usar no dia a dia em 3 passos",
  "Comparo com o que eu usava antes",
  "Conto quanto tempo levou pra fazer efeito",
  "Respondo as 3 dúvidas que mais me perguntam",
];

const ctasPadrao = [
  "Tá na sacolinha, corre que o cupom acaba hoje",
  "Clica no link fixado e garante o seu",
  "Comenta EU QUERO que eu te mando o link",
];

type Aba = "multiplicador" | "roteiro" | "live";

function etiqueta(gi: number, ci: number, ti: number) {
  const score = (gi * 7 + ci * 3 + ti * 11) % 10;
  if (score >= 6) return { rotulo: "Original", cor: "text-primary", nota: "poste primeiro" };
  if (score >= 3)
    return { rotulo: "Repete um pouco", cor: "text-gold", nota: "diferencie a headline" };
  return { rotulo: "Bem parecido", cor: "text-accent", nota: "deixe por último" };
}

const ordemPeso: Record<string, number> = {
  Original: 0,
  "Repete um pouco": 1,
  "Bem parecido": 2,
};

function Estudio() {
  const [aba, setAba] = useState<Aba>("multiplicador");
  const [ganchos, setGanchos] = useState(ganchosPadrao.join("\n"));
  const [corpos, setCorpos] = useState(corposPadrao.join("\n"));
  const [ctas, setCtas] = useState(ctasPadrao.join("\n"));
  const [gerado, setGerado] = useState(false);
  const [produtoId, setProdutoId] = useState(produtos[0]!.id);
  const [roteiro, setRoteiro] = useState<string[] | null>(null);
  const [liveRoteiro, setLiveRoteiro] = useState<string[] | null>(null);
  const [duracao, setDuracao] = useState(30);

  const listas = useMemo(() => {
    const clean = (s: string) =>
      s
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    return { g: clean(ganchos), c: clean(corpos), t: clean(ctas) };
  }, [ganchos, corpos, ctas]);

  const total = listas.g.length * listas.c.length * listas.t.length;

  const combos = useMemo(() => {
    const out: {
      id: string;
      gancho: string;
      corpo: string;
      cta: string;
      rotulo: string;
      cor: string;
      nota: string;
    }[] = [];
    listas.g.forEach((g, gi) =>
      listas.c.forEach((c, ci) =>
        listas.t.forEach((t, ti) => {
          const e = etiqueta(gi, ci, ti);
          out.push({
            id: `${gi}-${ci}-${ti}`,
            gancho: g,
            corpo: c,
            cta: t,
            rotulo: e.rotulo,
            cor: e.cor,
            nota: e.nota,
          });
        }),
      ),
    );
    return out.sort((a, b) => ordemPeso[a.rotulo]! - ordemPeso[b.rotulo]!);
  }, [listas]);

  const produto = produtos.find((p) => p.id === produtoId)!;

  const gerarRoteiro = () => {
    setRoteiro([
      `GANCHO (0-3s): "Ninguém acredita que ${produto.nome.toLowerCase()} custa R$ ${produto.preco
        .toFixed(2)
        .replace(".", ",")}."`,
      `PROVA (3-10s): mostre o produto de perto e diga que ${produto.criadores} criadores já estão vendendo ele.`,
      `BENEFÍCIO (10-20s): conte o problema que ele resolve em 1 frase e o resultado em 1 frase.`,
      `OBJEÇÃO (20-27s): "e se não funcionar?" — fale do preço baixo e da facilidade de testar.`,
      `CTA (27-32s): "tá na sacolinha, corre que o cupom acaba hoje".`,
      `LEGENDA: ${produto.nicho} · #tiktokshop #achadinhos #${produto.nicho.toLowerCase()}`,
    ]);
  };

  const gerarLive = () => {
    const blocos = Math.max(3, Math.round(duracao / 10));
    setLiveRoteiro([
      `ABERTURA (5 min): cumprimente, diga o que vai mostrar e ancore a oferta de ${produto.nome}.`,
      ...Array.from({ length: blocos }, (_, i) =>
        `BLOCO ${i + 1} (10 min): demonstre o produto, leia 2 comentários, repita o preço R$ ${produto.preco
          .toFixed(2)
          .replace(".", ",")} e chame pro carrinho.`,
      ),
      `FECHAMENTO (5 min): recapitule, dê urgência de estoque e agende a próxima live.`,
    ]);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Estúdio</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Multiplique seus vídeos e gere roteiros prontos pra gravar.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              { id: "multiplicador", label: "Multiplicador de Vídeos" },
              { id: "roteiro", label: "Roteirizar vídeo com IA" },
              { id: "live", label: "Roteirizar live" },
            ] as { id: Aba; label: string }[]
          ).map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                aba === a.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {aba === "multiplicador" && (
          <>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {[
                { t: "Ganchos", v: ganchos, set: setGanchos, n: listas.g.length },
                { t: "Corpos", v: corpos, set: setCorpos, n: listas.c.length },
                { t: "CTAs", v: ctas, set: setCtas, n: listas.t.length },
              ].map((b) => (
                <div key={b.t} className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">{b.t}</h2>
                    <span className="text-xs text-primary">{b.n} pedaços</span>
                  </div>
                  <textarea
                    value={b.v}
                    onChange={(e) => b.set(e.target.value)}
                    rows={10}
                    className="mt-3 w-full resize-y rounded-xl border border-input bg-secondary/40 p-3 text-[13px] leading-relaxed outline-none focus:border-primary"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">Um pedaço por linha.</p>
                </div>
              ))}
            </div>

            <div className="glow mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-neon px-6 py-5 text-primary-foreground">
              <p className="font-display text-xl font-bold">
                {listas.g.length} × {listas.c.length} × {listas.t.length} = {total} vídeos
              </p>
              <button
                onClick={() => setGerado(true)}
                className="rounded-full bg-background/85 px-5 py-2.5 text-sm font-semibold text-foreground"
              >
                Montar os {total} vídeos
              </button>
            </div>

            {gerado && (
              <div className="mt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-bold">
                    Galeria montada · ordem certa de postar
                  </h2>
                  <span className="text-[13px] text-muted-foreground">
                    mostrando os 60 primeiros de {combos.length}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {combos.slice(0, 60).map((c, i) => (
                    <div key={c.id} className="glass rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          vídeo {String(i + 1).padStart(3, "0")}
                        </span>
                        <span className={`text-xs font-semibold ${c.cor}`}>{c.rotulo}</span>
                      </div>
                      <p className="mt-3 text-[13px] font-medium">{c.gancho}</p>
                      <p className="mt-1.5 text-[12.5px] text-muted-foreground">{c.corpo}</p>
                      <p className="mt-1.5 text-[12.5px] text-primary">{c.cta}</p>
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-[11.5px] text-muted-foreground">{c.nota}</span>
                        <button className="text-[12px] font-semibold text-foreground">
                          Baixar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {(aba === "roteiro" || aba === "live") && (
          <div className="mt-6 grid gap-4 lg:grid-cols-[340px_1fr]">
            <div className="glass rounded-2xl p-5">
              <label className="text-xs text-muted-foreground">Produto</label>
              <select
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>

              {aba === "live" && (
                <div className="mt-4">
                  <label className="text-xs text-muted-foreground">
                    Duração da live: {duracao} min
                  </label>
                  <input
                    type="range"
                    min={20}
                    max={120}
                    step={10}
                    value={duracao}
                    onChange={(e) => setDuracao(Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                </div>
              )}

              <button
                onClick={aba === "roteiro" ? gerarRoteiro : gerarLive}
                className="mt-5 w-full rounded-full bg-gradient-neon py-3 text-sm font-semibold text-primary-foreground"
              >
                Gerar roteiro
              </button>
              <p className="mt-3 text-xs text-muted-foreground">
                Roteiro montado a partir das métricas do produto escolhido.
              </p>
            </div>

            <div className="glass rounded-2xl p-6">
              {aba === "roteiro" ? (
                roteiro ? (
                  <div className="space-y-3">
                    {roteiro.map((l) => (
                      <p key={l} className="text-[14px] leading-relaxed">
                        {l}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Escolha um produto e gere o roteiro de gancho, corpo e CTA.
                  </p>
                )
              ) : liveRoteiro ? (
                <div className="space-y-3">
                  <p className="text-xs tracking-widest text-primary uppercase">
                    Modo teleprompter
                  </p>
                  {liveRoteiro.map((l, i) => (
                    <p key={i} className="text-[15px] leading-relaxed">
                      {l}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Escolha o produto e a duração para montar o roteiro da live.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
