import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, Film, Sparkles, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { AiResultado } from "@/components/AiResultado";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { consultarVideo, criarVideo, gerarTexto } from "@/lib/ai.functions";
import { baixarBlob, montarVideo, type ClipeLocal } from "@/lib/video-composer";

export const Route = createFileRoute("/estudio")({
  head: () => ({
    meta: [
      { title: "Multiplicador de vídeos e roteiros — T@arte" },
      { name: "description", content: "Combine 10 ganchos, 5 corpos e 3 CTAs em até 150 vídeos e crie roteiros livres com IA." },
      { property: "og:title", content: "Multiplicador de vídeos — T@arte" },
      { property: "og:description", content: "Envie 18 trechos e monte até 150 vídeos prontos para postar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Estudio,
});

type Aba = "multiplicador" | "roteiro" | "live";
type Categoria = "gancho" | "corpo" | "cta";
type Resultado = { id: string; nome: string; url: string };

const limites: Record<Categoria, number> = { gancho: 10, corpo: 5, cta: 3 };
const nomes: Record<Categoria, string> = { gancho: "Ganchos", corpo: "Corpos", cta: "CTAs" };

function arquivosParaClipes(arquivos: FileList | null, atual: ClipeLocal[], limite: number) {
  if (!arquivos) return atual;
  return [...atual, ...Array.from(arquivos).map((arquivo) => ({
    id: crypto.randomUUID(), nome: arquivo.name, arquivo, url: URL.createObjectURL(arquivo),
  }))].slice(0, limite);
}

function Estudio() {
  const [aba, setAba] = useState<Aba>("multiplicador");
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Estúdio</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">Transforme 18 trechos em 150 vídeos ou crie roteiros para qualquer produto ou serviço.</p>
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Ferramentas do Estúdio">
          {([{ id: "multiplicador", label: "Multiplicador de vídeos" }, { id: "roteiro", label: "Roteirizar vídeo" }, { id: "live", label: "Roteirizar live" }] as const).map((item) => (
            <Button key={item.id} type="button" role="tab" aria-selected={aba === item.id} variant={aba === item.id ? "secondary" : "ghost"} onClick={() => setAba(item.id)}>{item.label}</Button>
          ))}
        </div>
        {aba === "multiplicador" ? <Multiplicador /> : <RoteiroLivre tipo={aba} />}
      </main>
    </div>
  );
}

function Multiplicador() {
  const criar = useServerFn(criarVideo);
  const consultar = useServerFn(consultarVideo);
  const [clipes, setClipes] = useState<Record<Categoria, ClipeLocal[]>>({ gancho: [], corpo: [], cta: [] });
  const [produto, setProduto] = useState("");
  const [estilo, setEstilo] = useState("UGC natural, vertical, falando direto para a câmera");
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [progresso, setProgresso] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const pararRef = useRef(false);
  const completos = clipes.gancho.length === 10 && clipes.corpo.length === 5 && clipes.cta.length === 3;
  const combinacoes = useMemo(() => clipes.gancho.flatMap((gancho, gi) => clipes.corpo.flatMap((corpo, ci) => clipes.cta.map((cta, ti) => ({ id: `${gi}-${ci}-${ti}`, nome: `tarte-${gi + 1}-${ci + 1}-${ti + 1}.webm`, partes: [gancho, corpo, cta] })))), [clipes]);

  useEffect(() => () => {
    Object.values(clipes).flat().forEach((clipe) => URL.revokeObjectURL(clipe.url));
    resultados.forEach((resultado) => URL.revokeObjectURL(resultado.url));
  }, []);

  const remover = (categoria: Categoria, id: string) => {
    setClipes((atual) => ({ ...atual, [categoria]: atual[categoria].filter((clipe) => {
      if (clipe.id === id) URL.revokeObjectURL(clipe.url);
      return clipe.id !== id;
    }) }));
  };

  const montarTodos = async () => {
    if (!completos) return;
    pararRef.current = false;
    setErro(null);
    setResultados([]);
    setStatus("Montando os vídeos no seu aparelho…");
    try {
      for (let indice = 0; indice < combinacoes.length; indice++) {
        if (pararRef.current) break;
        const combinacao = combinacoes[indice];
        if (!combinacao) continue;
        const blob = await montarVideo(combinacao.partes);
        const url = URL.createObjectURL(blob);
        setResultados((atual) => [...atual, { id: combinacao.id, nome: combinacao.nome, url }]);
        setProgresso(Math.round(((indice + 1) / combinacoes.length) * 100));
      }
      setStatus(pararRef.current ? "Montagem pausada. Os vídeos concluídos continuam disponíveis." : "Os 150 vídeos estão prontos na galeria abaixo.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível montar os vídeos neste aparelho.");
    }
  };

  const gerarClipe = async (categoria: Categoria, numero: number) => {
    const instrucoes: Record<Categoria, string> = {
      gancho: "uma abertura de 5 segundos com frase forte que desperte curiosidade",
      corpo: "uma demonstração de 8 segundos mostrando benefício e uso",
      cta: "um encerramento de 5 segundos chamando para comprar, comentar ou acessar o link",
    };
    const { id } = await criar({ data: { pedido: `Vídeo vertical ${estilo}. Divulgue ${produto}. Crie ${instrucoes[categoria]}, variação ${numero + 1}. Fala em português do Brasil, som limpo e sem texto ilegível.`, duracao: categoria === "corpo" ? "8s" : "5s", formato: "9:16" } });
    for (let tentativa = 0; tentativa < 90; tentativa++) {
      await new Promise((resolve) => window.setTimeout(resolve, 7000));
      const resposta = await consultar({ data: { id } });
      if (resposta.pronto && resposta.video) {
        const blob = await (await fetch(resposta.video)).blob();
        const arquivo = new File([blob], `ia-${categoria}-${numero + 1}.mp4`, { type: blob.type || "video/mp4" });
        return { id: crypto.randomUUID(), nome: arquivo.name, arquivo, url: URL.createObjectURL(blob) };
      }
    }
    throw new Error("Um dos vídeos demorou além do esperado.");
  };

  const gerarPacoteIA = async () => {
    if (produto.trim().length < 2) { setErro("Digite o produto ou serviço antes de gerar os 18 trechos."); return; }
    setErro(null);
    setProgresso(0);
    setStatus("Gerando os 18 trechos com IA, um por vez…");
    try {
      const novos: Record<Categoria, ClipeLocal[]> = { gancho: [], corpo: [], cta: [] };
      let concluido = 0;
      for (const categoria of ["gancho", "corpo", "cta"] as Categoria[]) {
        for (let indice = 0; indice < limites[categoria]; indice++) {
          setStatus(`Gerando ${nomes[categoria].toLowerCase()} ${indice + 1} de ${limites[categoria]}…`);
          novos[categoria].push(await gerarClipe(categoria, indice));
          concluido += 1;
          setProgresso(Math.round((concluido / 18) * 100));
          setClipes({ gancho: [...novos.gancho], corpo: [...novos.corpo], cta: [...novos.cta] });
        }
      }
      setStatus("Os 18 trechos foram gerados. Agora você pode montar os 150 vídeos.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível gerar os vídeos com IA.");
      setStatus("Os trechos concluídos foram mantidos.");
    }
  };

  return (
    <section className="mt-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {(["gancho", "corpo", "cta"] as Categoria[]).map((categoria) => (
          <div key={categoria} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold">{nomes[categoria]}</h2><span className="text-xs text-primary">{clipes[categoria].length}/{limites[categoria]}</span></div>
            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input bg-secondary/30 px-3 py-4 text-xs text-muted-foreground hover:border-primary/60 hover:text-foreground">
              <Upload className="h-4 w-4" /> Buscar vídeos na galeria
              <input type="file" accept="video/*" multiple className="sr-only" onChange={(event) => { setClipes((atual) => ({ ...atual, [categoria]: arquivosParaClipes(event.target.files, atual[categoria], limites[categoria]) })); event.target.value = ""; }} />
            </label>
            <div className="mt-3 space-y-2">
              {clipes[categoria].map((clipe, indice) => (
                <div key={clipe.id} className="flex items-center gap-2 rounded-md border border-border p-2">
                  <video src={clipe.url} muted playsInline className="h-12 w-9 rounded-sm object-cover" />
                  <span className="min-w-0 flex-1 truncate text-xs">{indice + 1}. {clipe.nome}</span>
                  <Button size="icon" variant="ghost" aria-label={`Remover ${clipe.nome}`} onClick={() => remover(categoria, clipe.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 rounded-lg border border-border bg-card p-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground">Produto ou serviço<input value={produto} onChange={(e) => setProduto(e.target.value)} placeholder="Ex.: curso de confeitaria" className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /></label>
          <label className="text-xs text-muted-foreground">Estilo dos vídeos<input value={estilo} onChange={(e) => setEstilo(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /></label>
        </div>
        <Button onClick={gerarPacoteIA} variant="outline"><Sparkles className="h-4 w-4" />Gerar 10 ganchos, 5 corpos e 3 CTAs com IA</Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gradient-neon px-6 py-5 text-primary-foreground">
        <div><p className="font-display text-xl font-bold">10 × 5 × 3 = 150 vídeos</p><p className="text-xs opacity-80">A montagem acontece no seu aparelho e preserva o áudio.</p></div>
        <div className="flex gap-2"><Button onClick={montarTodos} disabled={!completos || Boolean(status?.startsWith("Montando"))} variant="secondary"><Film className="h-4 w-4" />Montar os 150 vídeos</Button>{status?.startsWith("Montando") && <Button onClick={() => { pararRef.current = true; }} variant="outline">Pausar</Button>}</div>
      </div>
      {(status || erro) && <div className="mt-4 rounded-md border border-border p-4" aria-live="polite"><p className="text-sm">{erro ?? status}</p>{progresso > 0 && <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-neon" style={{ width: `${progresso}%` }} /></div>}</div>}
      {resultados.length > 0 && <div className="mt-8"><h2 className="font-display text-xl font-bold">Galeria · {resultados.length} de 150 prontos</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{resultados.map((resultado, indice) => <div key={resultado.id} className="rounded-lg border border-border bg-card p-3"><video src={resultado.url} controls playsInline className="aspect-[9/16] max-h-72 w-full rounded-md bg-background object-contain" /><div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">Vídeo {String(indice + 1).padStart(3, "0")}</span><Button size="sm" variant="outline" onClick={async () => baixarBlob(await (await fetch(resultado.url)).blob(), resultado.nome)}><Download className="h-4 w-4" />Baixar</Button></div></div>)}</div></div>}
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
      setTexto(resposta.texto);
    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível criar o roteiro."); }
    finally { setCarregando(false); }
  };
  return <section className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]"><div className="rounded-lg border border-border bg-card p-5"><label className="text-xs text-muted-foreground">Produto ou serviço<input value={produto} onChange={(e) => setProduto(e.target.value)} placeholder="Digite livremente" className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /></label><label className="mt-4 block text-xs text-muted-foreground">Público<input value={publico} onChange={(e) => setPublico(e.target.value)} placeholder="Ex.: mães empreendedoras" className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /></label><label className="mt-4 block text-xs text-muted-foreground">Duração<input value={duracao} onChange={(e) => setDuracao(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /></label><Button onClick={enviar} disabled={carregando} className="mt-5 w-full">{carregando ? "Criando…" : "Criar roteiro com IA"}</Button></div><div className="rounded-lg border border-border bg-card p-6"><h2 className="mb-4 font-display text-lg font-semibold">Roteiro</h2><AiResultado texto={texto} carregando={carregando} erro={erro} vazio="Digite qualquer produto ou serviço e crie o roteiro." /></div></section>;
}