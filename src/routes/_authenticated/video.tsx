import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { criarVideo, consultarVideo, gerarTexto } from "@/lib/ai.functions";
import { produtos } from "@/lib/tarte-data";

export const Route = createFileRoute("/_authenticated/video")({
  head: () => ({
    meta: [
      { title: "Gerador de vídeo com IA — T@arte" },
      {
        name: "description",
        content:
          "Crie vídeos curtos com inteligência artificial para TikTok Shop: descreva a cena ou envie uma foto e receba o vídeo com som pronto pra postar.",
      },
      { property: "og:title", content: "Gerador de vídeo com IA — T@arte" },
      {
        property: "og:description",
        content: "Descreva a cena, escolha o formato e a IA cria seu vídeo em minutos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GeradorVideo,
});

const duracoes = ["5s", "6s", "8s", "10s"];

function GeradorVideo() {
  const criar = useServerFn(criarVideo);
  const consultar = useServerFn(consultarVideo);
  const escrever = useServerFn(gerarTexto);

  const [pedido, setPedido] = useState("");
  const [duracao, setDuracao] = useState("8s");
  const [formato, setFormato] = useState("9:16");
  const [imagem, setImagem] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [estado, setEstado] = useState<"parado" | "criando" | "escrevendo">("parado");
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const cancelado = useRef(false);

  const carregarFoto = (arquivo: File | undefined) => {
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => setImagem(String(leitor.result));
    leitor.readAsDataURL(arquivo);
  };

  const sugerirCena = async () => {
    setEstado("escrevendo");
    setErro(null);
    try {
      const produto = produtos[Math.floor(Math.random() * produtos.length)]!;
      const r = await escrever({
        data: {
          sistema:
            "Você escreve descrições de cena para geradores de vídeo por IA. Responda apenas com um parágrafo único em português do Brasil, descrevendo cena, câmera, luz, clima e o som desejado. Sem títulos, sem listas.",
          pedido: `Descreva uma cena de vídeo vertical de até 8 segundos para vender o produto "${produto.nome}" no TikTok Shop. Um único plano contínuo, sem cortes, com som ambiente descrito.`,
        },
      });
      setPedido(r.texto);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível sugerir a cena.");
    } finally {
      setEstado("parado");
    }
  };

  const gerar = async () => {
    setEstado("criando");
    setErro(null);
    setVideo(null);
    setProgresso(0);
    cancelado.current = false;
    try {
      const { id } = await criar({
        data: { pedido, duracao, formato, imagem: imagem ?? undefined },
      });
      for (let tentativa = 0; tentativa < 90; tentativa++) {
        if (cancelado.current) return;
        await new Promise((r) => setTimeout(r, 7000));
        const r = await consultar({ data: { id } });
        setProgresso(r.progresso);
        if (r.pronto && r.video) {
          setVideo(r.video);
          return;
        }
      }
      setErro("O vídeo está demorando mais que o normal. Tente gerar de novo.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível criar o vídeo agora.");
    } finally {
      setEstado("parado");
    }
  };

  const criando = estado === "criando";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Gerador de vídeo com IA</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Descreva a cena ou envie uma foto do produto. A inteligência artificial cria o vídeo com
          som, pronto pra postar.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[380px_1fr]">
          <div className="glass rounded-2xl p-5">
            <label className="text-xs text-muted-foreground">Cena do vídeo</label>
            <textarea
              value={pedido}
              onChange={(e) => setPedido(e.target.value)}
              rows={6}
              placeholder="ex: close no sérum facial sobre mármore claro, luz de manhã entrando pela janela, a mão gira o frasco devagar em um único plano contínuo, som suave de piano"
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={sugerirCena}
              disabled={estado !== "parado"}
              className="mt-2 text-[13px] font-semibold text-primary disabled:opacity-60"
            >
              {estado === "escrevendo" ? "Escrevendo…" : "Sugerir cena com IA"}
            </button>

            <label className="mt-4 block text-xs text-muted-foreground">Duração</label>
            <select
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {duracoes.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <label className="mt-4 block text-xs text-muted-foreground">Formato</label>
            <select
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
              disabled={!!imagem}
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-60"
            >
              <option value="9:16">Vertical (TikTok)</option>
              <option value="16:9">Horizontal</option>
            </select>

            <label className="mt-4 block text-xs text-muted-foreground">
              Foto de partida (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => carregarFoto(e.target.files?.[0])}
              className="mt-1.5 w-full text-[13px] text-muted-foreground"
            />
            {imagem && (
              <div className="mt-3 flex items-center gap-3">
                <img src={imagem} alt="Foto de partida" className="h-16 w-16 rounded-lg object-cover" />
                <button
                  onClick={() => setImagem(null)}
                  className="text-[13px] font-semibold text-primary"
                >
                  Remover foto
                </button>
              </div>
            )}

            <button
              onClick={gerar}
              disabled={criando || pedido.trim().length < 10}
              className="mt-5 w-full rounded-full bg-gradient-neon py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {criando ? "Criando vídeo…" : "Gerar vídeo com IA"}
            </button>
            <p className="mt-2 text-[12px] text-muted-foreground">
              O vídeo leva de 1 a 3 minutos. Deixe esta página aberta.
            </p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Seu vídeo</h2>
              {video && (
                <a
                  href={video}
                  download="tarte-video.mp4"
                  className="text-[13px] font-semibold text-primary"
                >
                  Baixar
                </a>
              )}
            </div>

            {erro && (
              <p className="rounded-xl border border-destructive/40 px-4 py-3 text-[13.5px] text-destructive">
                {erro}
              </p>
            )}

            {!erro && criando && (
              <div className="space-y-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-neon transition-all"
                    style={{ width: `${Math.max(progresso, 8)}%` }}
                  />
                </div>
                <p className="text-[13px] text-primary">
                  A inteligência artificial está filmando sua cena… {progresso}%
                </p>
              </div>
            )}

            {!erro && !criando && video && (
              <video
                src={video}
                controls
                playsInline
                className="mx-auto max-h-[70vh] rounded-xl"
              />
            )}

            {!erro && !criando && !video && (
              <p className="text-sm text-muted-foreground">
                Descreva a cena ao lado e clique em gerar para receber o vídeo.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
