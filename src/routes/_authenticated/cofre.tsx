import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { AiResultado } from "@/components/AiResultado";
import { gerarTexto } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/cofre")({
  head: () => ({
    meta: [
      { title: "Cofre de Prompts — T@arte" },
      {
        name: "description",
        content:
          "Biblioteca de prompts prontos para criar conteúdo do TikTok Shop, com gerador de prompt novo por inteligência artificial.",
      },
      { property: "og:title", content: "Cofre de Prompts — T@arte" },
      {
        property: "og:description",
        content: "Prompts prontos para roteiros, ganchos, legendas e análises — e IA pra criar novos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cofre,
});

type Prompt = { id: string; titulo: string; categoria: string; texto: string };

const prompts: Prompt[] = [
  {
    id: "pr1",
    titulo: "Gancho que vende em 3 segundos",
    categoria: "Roteiro",
    texto:
      "Crie 10 ganchos de até 8 palavras para um vídeo de TikTok Shop vendendo [PRODUTO]. Cada gancho deve apontar uma dor real do público e terminar em curiosidade aberta. Público: [PÚBLICO].",
  },
  {
    id: "pr2",
    titulo: "Roteiro completo de 30s",
    categoria: "Roteiro",
    texto:
      "Escreva um roteiro de 30 segundos para [PRODUTO] com blocos de tempo: gancho (0-3s), prova (3-10s), benefício (10-20s), objeção (20-27s) e CTA (27-30s). Tom: [TOM]. Fale como uma amiga recomendando.",
  },
  {
    id: "pr3",
    titulo: "Legenda com hashtags",
    categoria: "Legenda",
    texto:
      "Crie 5 legendas curtas para um vídeo de TikTok Shop sobre [PRODUTO], cada uma com 6 hashtags misturando nicho, tendência e intenção de compra. Nicho: [NICHO].",
  },
  {
    id: "pr4",
    titulo: "Comentários que convertem",
    categoria: "Engajamento",
    texto:
      "Escreva 8 respostas prontas para os comentários mais comuns em vídeos de vendas de [PRODUTO] (preço, onde comprar, funciona mesmo). Cada resposta deve responder e chamar pra sacolinha.",
  },
  {
    id: "pr5",
    titulo: "Análise de vídeo viral",
    categoria: "Análise",
    texto:
      "Vou te passar a transcrição de um vídeo viral do nicho [NICHO]: [TRANSCRIÇÃO]. Analise: por que viralizou, qual a estrutura usada e me devolva um roteiro adaptado para o produto [PRODUTO].",
  },
  {
    id: "pr6",
    titulo: "Ideias de vídeo para a semana",
    categoria: "Planejamento",
    texto:
      "Gere 7 ideias de vídeo para vender [PRODUTO] no TikTok Shop, uma por dia, alternando formatos (unboxing, teste, comparativo, tutorial, storytelling). Cada ideia com gancho pronto.",
  },
  {
    id: "pr7",
    titulo: "Script de live de vendas",
    categoria: "Live",
    texto:
      "Monte o roteiro de uma live de [MINUTOS] minutos vendendo [PRODUTO]: abertura, blocos de demonstração, leitura de comentários, gatilhos de urgência e fechamento. Preço: [PREÇO].",
  },
];

const categorias = ["Todas", ...Array.from(new Set(prompts.map((p) => p.categoria)))];

function Cofre() {
  const gerar = useServerFn(gerarTexto);
  const [categoria, setCategoria] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [copiado, setCopiado] = useState<string | null>(null);
  const [pedido, setPedido] = useState("");
  const [texto, setTexto] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const lista = useMemo(
    () =>
      prompts
        .filter((p) => (categoria === "Todas" ? true : p.categoria === categoria))
        .filter((p) => p.titulo.toLowerCase().includes(busca.toLowerCase())),
    [categoria, busca],
  );

  const copiar = (id: string, textoPr: string) => {
    navigator.clipboard.writeText(textoPr);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 1800);
  };

  const criarPrompt = async () => {
    if (pedido.trim().length < 5) {
      setErro("Descreva que tipo de prompt você precisa.");
      return;
    }
    setCarregando(true);
    setErro(null);
    setTexto(null);
    try {
      const r = await gerar({
        data: {
          sistema:
            "Você escreve prompts profissionais (prompt engineering) para quem cria conteúdo do TikTok Shop. O prompt deve ser reutilizável, com campos entre colchetes como [PRODUTO] para a pessoa preencher.",
          pedido: `Crie um prompt reutilizável para: ${pedido}. Entregue o título curto e o texto do prompt completo, com campos entre colchetes quando fizer sentido.`,
        },
      });
      setTexto(r.texto);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível criar o prompt agora.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Cofre de Prompts</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Prompts prontos pra produzir conteúdo — e a inteligência artificial cria um novo sob
          medida quando você precisar.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar prompt…"
            className="w-full max-w-xs rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="flex flex-wrap gap-2">
            {categorias.map((c) => (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                className={`rounded-full px-3.5 py-2 text-[13px] ${
                  categoria === c ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((p) => (
            <div key={p.id} className="glass flex flex-col rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{p.titulo}</p>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                  {p.categoria}
                </span>
              </div>
              <p className="mt-3 line-clamp-4 flex-1 text-[13px] leading-relaxed text-muted-foreground">
                {p.texto}
              </p>
              <button
                onClick={() => copiar(p.id, p.texto)}
                className="mt-4 rounded-full border border-border py-2 text-[13px] font-semibold"
              >
                {copiado === p.id ? "Copiado!" : "Copiar prompt"}
              </button>
            </div>
          ))}
        </div>

        <div className="glass mt-10 rounded-3xl p-6">
          <h2 className="font-display text-xl font-bold">Crie um prompt novo com IA</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[380px_1fr]">
            <div>
              <label className="text-xs text-muted-foreground">
                Para o que você precisa de um prompt?
              </label>
              <textarea
                value={pedido}
                onChange={(e) => setPedido(e.target.value)}
                rows={3}
                placeholder={'ex: escrever respostas para comentários tipo "quanto custa?" que vendem'}
                className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={criarPrompt}
                disabled={carregando}
                className="mt-4 w-full rounded-full bg-gradient-neon py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {carregando ? "Criando…" : "Criar prompt com IA"}
              </button>
            </div>
            <div className="rounded-2xl border border-border p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Prompt criado</h3>
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
                vazio="Descreva a necessidade ao lado e a IA cria o prompt."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
