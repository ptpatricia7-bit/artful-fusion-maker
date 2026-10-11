import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";
import { AiResultado } from "@/components/AiResultado";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { gerarTexto } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/estudio")({
  head: () => ({
    meta: [
      { title: "Estúdio de roteiros de vídeo e live — T@arte" },
      { name: "description", content: "Crie roteiros de vídeo e live com IA para qualquer produto ou serviço." },
      { property: "og:title", content: "Estúdio de roteiros — T@arte" },
      { property: "og:description", content: "Roteiros livres com IA para vídeos e lives de vendas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Estudio,
});

type Aba = "roteiro" | "live";

function Estudio() {
  const [aba, setAba] = useState<Aba>("roteiro");
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Estúdio</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">Crie roteiros de vídeo e de live para qualquer produto ou serviço.</p>
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Ferramentas do Estúdio">
          {([{ id: "roteiro", label: "Roteirizar vídeo" }, { id: "live", label: "Roteirizar live" }] as const).map((item) => (
            <Button key={item.id} type="button" role="tab" aria-selected={aba === item.id} variant={aba === item.id ? "secondary" : "ghost"} onClick={() => setAba(item.id)}>{item.label}</Button>
          ))}
        </div>
        <RoteiroLivre key={aba} tipo={aba} />
      </main>
    </div>
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