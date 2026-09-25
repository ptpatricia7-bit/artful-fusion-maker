import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { AiResultado } from "@/components/AiResultado";
import { gerarTexto } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/spy")({
  head: () => ({
    meta: [
      { title: "GeraSpy ADS — espie os anúncios que vendem — T@arte" },
      {
        name: "description",
        content:
          "Veja os criativos que mais vendem no TikTok Shop e peça para a inteligência artificial analisar e criar variações melhores.",
      },
      { property: "og:title", content: "GeraSpy ADS — T@arte" },
      {
        property: "og:description",
        content: "Biblioteca de anúncios vencedores com análise por IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Spy,
});

type Anuncio = {
  id: string;
  marca: string;
  nicho: string;
  formato: string;
  gasto: string;
  ctr: string;
  roas: string;
  gancho: string;
  diasAtivo: number;
};

const anuncios: Anuncio[] = [
  { id: "a1", marca: "GlowSkin", nicho: "Beleza", formato: "UGC rosto pra câmera", gasto: "R$ 84K", ctr: "3.8%", roas: "4.2", gancho: "Ninguém acredita que isso custa R$ 39", diasAtivo: 23 },
  { id: "a2", marca: "CasaPratica", nicho: "Casa", formato: "Antes e depois", gasto: "R$ 61K", ctr: "4.5%", roas: "5.1", gancho: "Minha geladeira mudou em 3 minutos", diasAtivo: 41 },
  { id: "a3", marca: "NutriFort", nicho: "Suplementos", formato: "Treino + texto", gasto: "R$ 55K", ctr: "2.9%", roas: "3.6", gancho: "O erro que todo mundo comete tomando isso", diasAtivo: 18 },
  { id: "a4", marca: "AromaLab", nicho: "Perfumaria", formato: "Unboxing", gasto: "R$ 47K", ctr: "3.3%", roas: "3.9", gancho: "Cheiro de perfume de R$ 800 por R$ 44", diasAtivo: 30 },
  { id: "a5", marca: "PetLovers", nicho: "Pet", formato: "POV animal", gasto: "R$ 39K", ctr: "5.2%", roas: "4.8", gancho: "Seu cachorro precisa ver isso", diasAtivo: 12 },
  { id: "a6", marca: "TechZap", nicho: "Eletrônicos", formato: "Teste ao vivo", gasto: "R$ 33K", ctr: "2.4%", roas: "2.8", gancho: "Não cai nem correndo 10km", diasAtivo: 26 },
];

function Spy() {
  const gerar = useServerFn(gerarTexto);
  const [selecionado, setSelecionado] = useState<Anuncio>(anuncios[0]!);
  const [pedido, setPedido] = useState("Crie 5 variações melhores desse gancho e um roteiro de 30s.");
  const [texto, setTexto] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const analisar = async () => {
    setCarregando(true);
    setErro(null);
    setTexto(null);
    try {
      const r = await gerar({
        data: {
          sistema:
            "Você é analista de criativos de anúncios (media buying) do TikTok Shop Brasil. Seja específico: aponte o que faz o criativo vencer e entregue material pronto para usar.",
          pedido: `Anúncio espionado: marca ${selecionado.marca}, nicho ${selecionado.nicho}, formato ${selecionado.formato}, gancho "${selecionado.gancho}", CTR ${selecionado.ctr}, ROAS ${selecionado.roas}, ${selecionado.diasAtivo} dias ativo, gasto estimado ${selecionado.gasto}.
Primeiro explique em 3 linhas por que ele está vendendo. Depois: ${pedido}`,
        },
      });
      setTexto(r.texto);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível analisar agora.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">GeraSpy ADS</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Espie os criativos que mais vendem e peça pra inteligência artificial criar variações
          melhores. Números demonstrativos.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {anuncios.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelecionado(a)}
              className={`glass rounded-2xl p-5 text-left transition-colors ${
                selecionado.id === a.id ? "glow border-primary/40" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">{a.marca}</p>
                <span className="text-xs text-muted-foreground">{a.diasAtivo} dias ativo</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {a.nicho} · {a.formato}
              </p>
              <p className="mt-3 text-[13.5px] font-medium">“{a.gancho}”</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-secondary/60 py-1.5">
                  <p className="font-semibold text-foreground">{a.ctr}</p>
                  <p className="text-muted-foreground">CTR</p>
                </div>
                <div className="rounded-lg bg-secondary/60 py-1.5">
                  <p className="font-semibold text-primary">{a.roas}x</p>
                  <p className="text-muted-foreground">ROAS</p>
                </div>
                <div className="rounded-lg bg-secondary/60 py-1.5">
                  <p className="font-semibold text-foreground">{a.gasto}</p>
                  <p className="text-muted-foreground">gasto</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="glass rounded-2xl p-5">
            <h2 className="font-display text-lg font-semibold">Análise com IA</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Analisando o anúncio da {selecionado.marca}.
            </p>
            <label className="mt-4 block text-xs text-muted-foreground">
              O que você quer que a IA faça com ele?
            </label>
            <textarea
              value={pedido}
              onChange={(e) => setPedido(e.target.value)}
              rows={4}
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {["Criar variações do gancho", "Roteiro de 30s", "Como bater esse anúncio"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setPedido(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
            <button
              onClick={analisar}
              disabled={carregando}
              className="mt-5 w-full rounded-full bg-gradient-neon py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {carregando ? "Analisando…" : "Analisar com IA"}
            </button>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Resultado</h2>
              {texto && (
                <button
                  onClick={() => navigator.clipboard.writeText(texto)}
                  className="text-[13px] font-semibold text-primary"
                >
                  Copiar
                </button>
              )}
            </div>
            <AiResultado
              texto={texto}
              carregando={carregando}
              erro={erro}
              vazio="Escolha um anúncio acima e peça a análise."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
