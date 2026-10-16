import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { AiResultado } from "@/components/AiResultado";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { gerarTexto } from "@/lib/ai.functions";
import { consultarVideoFal, criarVideoFal } from "@/lib/fal-video.functions";

export const Route = createFileRoute("/_authenticated/estudio")({
  head: () => ({
    meta: [
      { title: "Estúdio de roteiros e vídeos com IA — T@arte" },
      { name: "description", content: "Crie roteiros de vídeo e live e gere vídeos curtos com IA para qualquer produto ou serviço." },
      { property: "og:title", content: "Estúdio — T@arte" },
      { property: "og:description", content: "Roteiros e vídeos curtos com IA para vendas nas redes sociais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Estudio,
});

type Aba = "roteiro" | "live" | "video";

function Estudio() {
  const [aba, setAba] = useState<Aba>("roteiro");
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Estúdio</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">Crie roteiros de vídeo e de live para qualquer produto ou serviço, ou gere um vídeo curto com IA a partir de uma imagem.</p>
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Ferramentas do Estúdio">
          {([{ id: "roteiro", label: "Roteirizar vídeo" }, { id: "live", label: "Roteirizar live" }, { id: "video", label: "Vídeo com IA" }] as const).map((item) => (
            <Button key={item.id} type="button" role="tab" aria-selected={aba === item.id} variant={aba === item.id ? "secondary" : "ghost"} onClick={() => setAba(item.id)}>{item.label}</Button>
          ))}
        </div>
        {aba === "video" ? <VideoComIA /> : <RoteiroLivre key={aba} tipo={aba} />}
      </main>
    </div>
  );
}

const LIMITE_VIDEOS_DIA = 3;
const CHAVE_LIMITE = "tarte-videos-dia";

function lerUsoDiario(): number {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_LIMITE) ?? "{}") as { dia?: string; usados?: number };
    const hoje = new Date().toDateString();
    return salvo.dia === hoje && typeof salvo.usados === "number" ? salvo.usados : 0;
  } catch {
    return 0;
  }
}

function registrarUsoDiario(usados: number) {
  localStorage.setItem(CHAVE_LIMITE, JSON.stringify({ dia: new Date().toDateString(), usados }));
}

function VideoComIA() {
  const criar = useServerFn(criarVideoFal);
  const consultar = useServerFn(consultarVideoFal);
  const [imagem, setImagem] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [formato, setFormato] = useState<"9:16" | "16:9">("9:16");
  const [gerando, setGerando] = useState(false);
  const [video, setVideo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [usados, setUsados] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setUsados(lerUsoDiario());
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const escolherImagem = (arquivo: File | undefined) => {
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) { setErro("Escolha um arquivo de imagem."); return; }
    if (arquivo.size > 6 * 1024 * 1024) { setErro("A imagem está muito grande. Use uma menor."); return; }
    const leitor = new FileReader();
    leitor.onload = () => { setImagem(String(leitor.result)); setErro(null); };
    leitor.readAsDataURL(arquivo);
  };

  const gerar = async () => {
    if (!imagem) { setErro("Envie uma imagem para começar o vídeo."); return; }
    if (prompt.trim().length < 10) { setErro("Descreva o vídeo com mais detalhes."); return; }
    const uso = lerUsoDiario();
    if (uso >= LIMITE_VIDEOS_DIA) {
      setErro(`Você já gerou ${LIMITE_VIDEOS_DIA} vídeos hoje. O limite volta a liberar amanhã.`);
      setUsados(uso);
      return;
    }
    setGerando(true); setErro(null); setVideo(null);
    try {
      const pedido = await criar({ data: { prompt, imagem, formato } });
      registrarUsoDiario(uso + 1);
      setUsados(uso + 1);
      timer.current = setInterval(async () => {
        try {
          const status = await consultar({ data: { statusUrl: pedido.statusUrl, respostaUrl: pedido.respostaUrl } });
          if (status.pronto && status.video) {
            if (timer.current) clearInterval(timer.current);
            setVideo(status.video);
            setGerando(false);
          }
        } catch (e) {
          if (timer.current) clearInterval(timer.current);
          setErro(e instanceof Error ? e.message : "Não foi possível gerar o vídeo agora.");
          setGerando(false);
        }
      }, 5000);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível gerar o vídeo agora.");
      setGerando(false);
    }
  };

  const esgotado = usados >= LIMITE_VIDEOS_DIA;
  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="rounded-lg border border-border bg-card p-5">
        <label className="block text-xs text-muted-foreground">
          Imagem inicial
          <input type="file" accept="image/*" onChange={(e) => escolherImagem(e.target.files?.[0])} className="mt-1.5 w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:text-foreground" />
        </label>
        {imagem && <img src={imagem} alt="Imagem enviada" className="mt-3 max-h-40 rounded-md border border-border object-cover" />}
        <label className="mt-4 block text-xs text-muted-foreground">
          Descrição do vídeo
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} placeholder="Ex.: a modelo gira mostrando a roupa, câmera se aproxima devagar" className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
        </label>
        <label className="mt-4 block text-xs text-muted-foreground">
          Proporção
          <select value={formato} onChange={(e) => setFormato(e.target.value as "9:16" | "16:9")} className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
            <option value="9:16">9:16 (vertical, redes sociais)</option>
            <option value="16:9">16:9 (horizontal)</option>
          </select>
        </label>
        <p className="mt-3 text-xs text-muted-foreground">Duração de 5 segundos em 720p. Restam {Math.max(0, LIMITE_VIDEOS_DIA - usados)} de {LIMITE_VIDEOS_DIA} vídeos hoje.</p>
        <Button onClick={gerar} disabled={gerando || esgotado} className="mt-4 w-full">
          {gerando ? "Gerando…" : esgotado ? "Limite diário atingido" : "Gerar vídeo com IA"}
        </Button>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Vídeo</h2>
        {erro && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{erro}</p>}
        {gerando && !erro && <p className="text-sm text-muted-foreground">Gerando seu vídeo… isso pode levar alguns minutos. Não feche a página.</p>}
        {video && (
          <div className="space-y-4">
            <video src={video} controls playsInline className="max-h-[480px] rounded-md border border-border" />
            <a href={video} download="tarte-video.mp4" className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Baixar vídeo</a>
          </div>
        )}
        {!gerando && !video && !erro && <p className="text-sm text-muted-foreground">Envie uma imagem, descreva a cena e gere um vídeo curto de 5 segundos.</p>}
      </div>
    </section>
  );
}

function RoteiroLivre({ tipo }: { tipo: "roteiro" | "live" }) {
  const gerar = useServerFn(gerarTexto);
  const [produto, setProduto] = useState("");
  const [publico, setPublico] = useState("");
  const [duracao, setDuracao] = useState(tipo === "live" ? "60 minutos" : "30 segundos");
  const [texto, setTexto] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const enviar = async () => {
    if (produto.trim().length < 2) { setErro("Digite o produto ou serviço."); return; }
    setCarregando(true); setErro(null); setTexto(null);
    try {
      const resposta = await gerar({ data: { sistema: tipo === "live" ? "Você cria roteiros completos de live de vendas, com falas prontas, demonstrações, interação e chamadas para ação." : "Você cria roteiros de vídeos curtos para redes sociais, com gancho, corpo, prova e chamada para ação.", pedido: `Crie um roteiro para divulgar ${produto}. Formato: ${tipo === "live" ? "live" : "vídeo curto"}. Duração: ${duracao}. Público: ${publico || "defina o público mais provável"}. Entregue falas prontas para ler.` } });
      if (resposta.erro) { setErro(resposta.erro); return; }
      setTexto(resposta.texto);
    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível criar o roteiro."); }
    finally { setCarregando(false); }
  };
  return <section className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]"><div className="rounded-lg border border-border bg-card p-5"><label className="text-xs text-muted-foreground">Produto ou serviço<input value={produto} onChange={(e) => setProduto(e.target.value)} placeholder="Digite livremente" className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /></label><label className="mt-4 block text-xs text-muted-foreground">Público<input value={publico} onChange={(e) => setPublico(e.target.value)} placeholder="Ex.: mães empreendedoras" className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /></label><label className="mt-4 block text-xs text-muted-foreground">Duração<input value={duracao} onChange={(e) => setDuracao(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /></label><Button onClick={enviar} disabled={carregando} className="mt-5 w-full">{carregando ? "Criando…" : "Criar roteiro com IA"}</Button></div><div className="rounded-lg border border-border bg-card p-6"><h2 className="mb-4 font-display text-lg font-semibold">Roteiro</h2><AiResultado texto={texto} carregando={carregando} erro={erro} vazio="Digite qualquer produto ou serviço e crie o roteiro." /></div></section>;
}
