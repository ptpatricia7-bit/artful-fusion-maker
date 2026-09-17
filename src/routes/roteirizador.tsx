import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { AiResultado } from "@/components/AiResultado";
import { gerarTexto } from "@/lib/ai.functions";

export const Route = createFileRoute("/roteirizador")({
  head: () => ({
    meta: [
      { title: "Roteirizador de vídeo com IA — T@arte" },
      {
        name: "description",
        content:
          "Gere roteiros de vídeo e de live para TikTok Shop com inteligência artificial: gancho, corpo, CTA e legenda prontos pra gravar.",
      },
      { property: "og:title", content: "Roteirizador de vídeo com IA — T@arte" },
      {
        property: "og:description",
        content: "Escolha o produto, o formato e receba o roteiro pronto pra gravar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Roteirizador,
});

const formatos = ["Vídeo de 30s", "Vídeo de 60s", "Unboxing", "Antes e depois", "Live"];
const tons = ["Amiga sincera", "Direto e agressivo", "Divertido", "Especialista"];

function Roteirizador() {
  const gerar = useServerFn(gerarTexto);
  const [produtoNome, setProdutoNome] = useState("");
  const [formato, setFormato] = useState(formatos[0]!);
  const [tom, setTom] = useState(tons[0]!);
  const [publico, setPublico] = useState("mulheres de 25 a 40 anos que compram no TikTok");
  const [extra, setExtra] = useState("");
  const [texto, setTexto] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async () => {
    if (produtoNome.trim().length < 2) {
      setErro("Digite o produto ou serviço que deseja divulgar.");
      return;
    }
    setCarregando(true);
    setErro(null);
    setTexto(null);
    try {
      const r = await gerar({
        data: {
          sistema:
            "Você escreve roteiros de vídeo para afiliados do TikTok Shop Brasil. Entregue blocos com marcação de tempo, falas prontas para ler, ideias de imagem e legenda com hashtags.",
          pedido: `Escreva um roteiro no formato "${formato}" para divulgar este produto ou serviço: "${produtoNome}". Tom de voz: ${tom}. Público: ${publico}. ${extra}
Estrutura: 3 opções de gancho (0-3s), corpo com marcação de tempo, quebra de objeção, CTA e legenda com hashtags.`,
        },
      });
      setTexto(r.texto);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível gerar agora.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Roteirizador de vídeo com IA</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Escolha produto, formato e tom. A inteligência artificial escreve o roteiro completo.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="glass rounded-2xl p-5">
            <label className="text-xs text-muted-foreground">Produto ou serviço</label>
            <input
              value={produtoNome}
              onChange={(e) => setProdutoNome(e.target.value)}
              placeholder="Ex.: limpeza de pele, curso de inglês ou sérum facial"
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />

            <label className="mt-4 block text-xs text-muted-foreground">Formato</label>
            <select
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {formatos.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>

            <label className="mt-4 block text-xs text-muted-foreground">Tom de voz</label>
            <select
              value={tom}
              onChange={(e) => setTom(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {tons.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <label className="mt-4 block text-xs text-muted-foreground">Público</label>
            <input
              value={publico}
              onChange={(e) => setPublico(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />

            <label className="mt-4 block text-xs text-muted-foreground">
              Algo mais que deve entrar
            </label>
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              rows={3}
              placeholder="ex: citar cupom de 20% e frete grátis"
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />

            <button
              onClick={enviar}
              disabled={carregando}
              className="mt-5 w-full rounded-full bg-gradient-neon py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {carregando ? "Gerando…" : "Gerar roteiro com IA"}
            </button>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Roteiro</h2>
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
              vazio="Preencha ao lado e clique em gerar para receber o roteiro."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
