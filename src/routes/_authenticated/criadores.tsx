import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, ImageIcon, Sparkles } from "lucide-react";
import { useState } from "react";
import { AiResultado } from "@/components/AiResultado";
import { AppNav } from "@/components/AppNav";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { gerarImagemCriativo, gerarTexto } from "@/lib/ai.functions";

export const Route = createFileRoute("/criadores")({
  head: () => ({ meta: [
    { title: "Criativos para redes sociais — T@arte" },
    { name: "description", content: "Crie conceitos, textos, legendas e imagens para TikTok, Instagram e YouTube com inteligência artificial." },
    { property: "og:title", content: "Criativos para redes sociais — T@arte" },
    { property: "og:description", content: "Produza seu criativo completo com texto e imagem prontos para postar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Criativos,
});

function Criativos() {
  const escrever = useServerFn(gerarTexto);
  const criarImagem = useServerFn(gerarImagemCriativo);
  const [produto, setProduto] = useState("");
  const [rede, setRede] = useState("Instagram");
  const [formato, setFormato] = useState("Post vertical 4:5");
  const [objetivo, setObjetivo] = useState("Vender");
  const [conceito, setConceito] = useState("");
  const [texto, setTexto] = useState<string | null>(null);
  const [imagem, setImagem] = useState<string | null>(null);
  const [estado, setEstado] = useState<"parado" | "texto" | "imagem">("parado");
  const [erro, setErro] = useState<string | null>(null);

  const gerarCopy = async () => {
    if (produto.trim().length < 2) { setErro("Digite o produto ou serviço do criativo."); return; }
    setEstado("texto"); setErro(null); setTexto(null);
    try {
      const resposta = await escrever({ data: { sistema: "Você é diretor criativo de redes sociais. Crie material original, específico e pronto para publicar.", pedido: `Crie um criativo para ${rede}, formato ${formato}, objetivo ${objetivo}, divulgando ${produto}. Preferência da pessoa: ${conceito || "defina a melhor direção"}. Entregue conceito visual, título, texto principal, legenda, CTA e hashtags.` } });
      setTexto(resposta.texto);
    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível criar o texto."); }
    finally { setEstado("parado"); }
  };

  const gerarArte = async () => {
    if (produto.trim().length < 2) { setErro("Digite o produto ou serviço do criativo."); return; }
    setEstado("imagem"); setErro(null); setImagem(null);
    try { const resposta = await criarImagem({ data: { produto, rede, formato, conceito: `${objetivo}. ${conceito}` } }); setImagem(resposta.imagem); }
    catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível criar a imagem."); }
    finally { setEstado("parado"); }
  };

  return <div className="min-h-screen"><SiteHeader /><AppNav /><main className="mx-auto max-w-6xl px-5 py-10"><div className="flex items-start gap-3"><div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></div><div><h1 className="font-display text-3xl font-bold">Criativos para redes sociais</h1><p className="mt-1 text-[13.5px] text-muted-foreground">Crie conceito, texto, legenda e imagem para publicar nas suas redes.</p></div></div><div className="mt-7 grid gap-4 lg:grid-cols-[360px_1fr]"><section className="rounded-lg border border-border bg-card p-5"><label className="text-xs text-muted-foreground">Produto ou serviço<input value={produto} onChange={(e) => setProduto(e.target.value)} placeholder="Ex.: consultoria financeira" className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /></label><div className="mt-4 grid grid-cols-2 gap-3"><label className="text-xs text-muted-foreground">Rede<select value={rede} onChange={(e) => setRede(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground"><option>TikTok</option><option>Instagram</option><option>YouTube</option><option>WhatsApp</option></select></label><label className="text-xs text-muted-foreground">Objetivo<select value={objetivo} onChange={(e) => setObjetivo(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground"><option>Vender</option><option>Gerar contatos</option><option>Engajar</option><option>Apresentar marca</option></select></label></div><label className="mt-4 block text-xs text-muted-foreground">Formato<select value={formato} onChange={(e) => setFormato(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground"><option>Post vertical 4:5</option><option>Story 9:16</option><option>Capa de vídeo 9:16</option><option>Miniatura 16:9</option><option>Quadrado 1:1</option></select></label><label className="mt-4 block text-xs text-muted-foreground">Ideia ou estilo<textarea value={conceito} onChange={(e) => setConceito(e.target.value)} rows={4} placeholder="Ex.: moderno, alegre, com o produto no centro" className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /></label><div className="mt-5 grid gap-2"><Button onClick={gerarCopy} disabled={estado !== "parado"}><Sparkles className="h-4 w-4" />{estado === "texto" ? "Criando texto…" : "Criar texto do criativo"}</Button><Button onClick={gerarArte} disabled={estado !== "parado"} variant="outline"><ImageIcon className="h-4 w-4" />{estado === "imagem" ? "Criando imagem…" : "Criar imagem do criativo"}</Button></div></section><section className="grid gap-4 md:grid-cols-2"><div className="rounded-lg border border-border bg-card p-5"><h2 className="mb-4 font-display text-lg font-semibold">Texto pronto</h2><AiResultado texto={texto} carregando={estado === "texto"} erro={erro} vazio="Configure o criativo e gere o texto." />{texto && <Button variant="outline" size="sm" className="mt-4" onClick={() => navigator.clipboard.writeText(texto)}>Copiar texto</Button>}</div><div className="flex min-h-96 items-center justify-center rounded-lg border border-border bg-card p-5">{estado === "imagem" ? <p className="text-sm text-primary">Criando sua imagem…</p> : imagem ? <div className="text-center"><img src={imagem} alt={`Criativo para ${produto}`} className="max-h-[560px] w-full rounded-md object-contain" /><Button asChild variant="outline" className="mt-4"><a href={imagem} download="tarte-criativo.png"><Download className="h-4 w-4" />Baixar imagem</a></Button></div> : <div className="text-center text-muted-foreground"><ImageIcon className="mx-auto h-8 w-8" /><p className="mt-3 text-sm">Sua imagem aparecerá aqui.</p></div>}</div></section></div></main></div>;
}