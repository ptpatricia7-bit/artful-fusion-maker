import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { AiResultado } from "@/components/AiResultado";
import { AppNav } from "@/components/AppNav";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { pesquisarMercado } from "@/lib/ai.functions";
import { brl, produtos } from "@/lib/tarte-data";

export const Route = createFileRoute("/produtos")({
  head: () => ({ meta: [
    { title: "Pesquisa de produtos e criadores — T@arte" },
    { name: "description", content: "Pesquise produtos, serviços e criadores em destaque no TikTok, Instagram e YouTube." },
    { property: "og:title", content: "Pesquisa multiplataforma — T@arte" },
    { property: "og:description", content: "Descubra produtos em alta, sinais de vendas e criadores que se destacam." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Produtos,
});

const plataformas = ["Todas", "TikTok", "Instagram", "YouTube"];

function Produtos() {
  const pesquisar = useServerFn(pesquisarMercado);
  const [termo, setTermo] = useState("");
  const [plataforma, setPlataforma] = useState("Todas");
  const [texto, setTexto] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const enviar = async () => {
    if (termo.trim().length < 2) { setErro("Digite um produto, serviço ou nicho."); return; }
    setCarregando(true); setErro(null); setTexto(null);
    try { const resposta = await pesquisar({ data: { termo, plataforma } }); setTexto(resposta.texto); }
    catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível fazer a pesquisa."); }
    finally { setCarregando(false); }
  };
  return <div className="min-h-screen"><SiteHeader /><AppNav /><main className="mx-auto max-w-6xl px-5 py-10"><h1 className="font-display text-3xl font-bold">Produtos que estão vendendo</h1><p className="mt-2 max-w-2xl text-[13.5px] text-muted-foreground">Pesquise TikTok, Instagram e YouTube para encontrar ofertas em alta, sinais públicos de faturamento e quem está vendendo melhor.</p><div className="mt-6 grid gap-4 rounded-lg border border-border bg-card p-5 lg:grid-cols-[1fr_auto]"><div><label className="text-xs text-muted-foreground">Produto, serviço ou nicho</label><div className="mt-1.5 flex gap-2"><input value={termo} onChange={(e) => setTermo(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void enviar(); }} placeholder="Ex.: beleza, curso de inglês, air fryer" className="min-w-0 flex-1 rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary" /><Button onClick={enviar} disabled={carregando}><Search className="h-4 w-4" />Pesquisar</Button></div></div><div><span className="text-xs text-muted-foreground">Rede</span><div className="mt-1.5 flex flex-wrap gap-1">{plataformas.map((item) => <Button key={item} size="sm" variant={plataforma === item ? "secondary" : "ghost"} onClick={() => setPlataforma(item)}>{item}</Button>)}</div></div></div><div className="mt-4 rounded-lg border border-border bg-card p-6"><div className="mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-semibold">Pesquisa atual com fontes públicas</h2></div><AiResultado texto={texto} carregando={carregando} erro={erro} vazio="Digite o que deseja pesquisar. Faturamentos sem comprovação pública serão identificados como estimativas." /></div><section className="mt-10"><h2 className="font-display text-xl font-bold">Radar demonstrativo</h2><p className="mt-1 text-xs text-muted-foreground">Exemplos internos para explorar o painel; use a pesquisa acima para informações atuais.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{produtos.slice(0, 6).map((produto) => <button key={produto.id} onClick={() => setTermo(produto.nome)} className="rounded-lg border border-border bg-card p-4 text-left"><p className="font-medium">{produto.nome}</p><p className="mt-1 text-xs text-muted-foreground">{produto.nicho} · {produto.vendas.toLocaleString("pt-BR")} vendas demonstrativas</p><p className="mt-3 font-display text-lg font-bold text-primary">{brl(produto.faturamento)}</p></button>)}</div></section></main></div>;
}