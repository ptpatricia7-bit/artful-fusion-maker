import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, Copy, Sparkles, FileText, Volume2, Package, Image, ListChecks } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { gerarTexto, gerarImagemCriativo } from "@/lib/ai.functions";
import { generatorConfig, type GeneratorMode } from "@/lib/generator-config";
import { supabase } from "@/integrations/supabase/client";

export function GeneratorTool({ mode }: { mode: GeneratorMode }) {
  const config = generatorConfig[mode];
  const textFn = useServerFn(gerarTexto);
  const imageFn = useServerFn(gerarImagemCriativo);
  const [prompt, setPrompt] = useState("");
  const [details, setDetails] = useState("");
  const [format, setFormat] = useState("Feed quadrado 1:1");
  const [voice, setVoice] = useState("Kore");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<string | null>(null);
  useEffect(() => () => { if (audioRef.current) URL.revokeObjectURL(audioRef.current); }, []);
  const Icon = { paginas: FileText, audio: Volume2, produto: Package, banner: Image, quiz: ListChecks }[mode];
  const generate = async () => {
    if (prompt.trim().length < 3) { setError("Preencha a descrição com pelo menos 3 caracteres."); return; }
    setBusy(true); setError(""); setCopied(false); setResult("");
    try {
      if (mode === "audio") {
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error("Entre novamente para continuar.");
        const response = await fetch("/api/audio", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ texto: prompt, voz: voice }) });
        if (!response.ok) { const body = await response.json(); throw new Error(body.erro || "Não foi possível criar o áudio."); }
        const blob = await response.blob();
        if (!blob.size || !blob.type.startsWith("audio/")) throw new Error("O serviço não retornou um áudio válido.");
        if (audioRef.current) URL.revokeObjectURL(audioRef.current);
        audioRef.current = URL.createObjectURL(blob); setResult(audioRef.current);
      } else if (mode === "banner") {
        const response = await imageFn({ data: { produto: prompt, rede: "Campanha publicitária", formato: format, conceito: details } });
        setResult(response.imagem);
      } else {
        const response = await textFn({ data: { sistema: config.instruction, pedido: `${prompt}\nDetalhes adicionais: ${details}` } });
        if (response.erro) throw new Error(response.erro);
        setResult(response.texto.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/, ""));
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível gerar agora."); }
    finally { setBusy(false); }
  };
  const download = async () => {
    try {
      const blob = mode === "audio" || mode === "banner" ? await (await fetch(result)).blob() : new Blob([result], { type: mode === "produto" ? "text/plain;charset=utf-8" : "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `tarte-${mode}.${config.extension}`; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setError("Não foi possível baixar o arquivo."); }
  };
  return <div className="min-h-screen"><SiteHeader /><AppNav /><main className="mx-auto max-w-6xl px-5 py-10">
    <div className="flex items-center gap-3"><Icon className="h-7 w-7 text-primary" /><h1 className="font-display text-3xl font-bold">{config.title}</h1></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form className="space-y-5 self-start rounded-lg border border-border bg-card p-5" onSubmit={(e) => { e.preventDefault(); void generate(); }}>
        <h2 className="font-semibold">Configurações</h2>
        <label className="block text-sm text-muted-foreground">{config.label}<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={config.placeholder} maxLength={mode === "audio" ? 3000 : 2500} rows={6} className="mt-2 w-full rounded-md border border-input bg-secondary/40 p-3 text-sm text-foreground outline-none focus:border-primary" /></label>
        {mode === "audio" ? <label className="block text-sm text-muted-foreground">Voz<select value={voice} onChange={(e) => setVoice(e.target.value)} className="mt-2 w-full rounded-md border border-input bg-secondary p-2 text-foreground"><option value="Kore">Kore</option><option value="Puck">Puck</option></select><span className="mt-2 block text-xs">{prompt.length}/3.000</span></label> : <label className="block text-sm text-muted-foreground">Detalhes adicionais<textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1200} placeholder="Público, estilo, cores, informações da oferta…" className="mt-2 w-full rounded-md border border-input bg-secondary/40 p-3 text-sm text-foreground outline-none focus:border-primary" /></label>}
        {mode === "banner" && <label className="block text-sm text-muted-foreground">Formato<select value={format} onChange={(e) => setFormat(e.target.value)} className="mt-2 w-full rounded-md border border-input bg-secondary p-2 text-foreground"><option>Feed quadrado 1:1</option><option>Stories vertical 9:16</option><option>Banner horizontal 16:9</option></select></label>}
        <Button type="submit" disabled={busy} className="w-full"><Sparkles />{busy ? "Gerando…" : "Gerar com IA"}</Button>
      </form>
      <section className="min-w-0 rounded-lg border border-border bg-card p-5" aria-busy={busy}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">{config.result}</h2>{result && <div className="flex gap-2">{mode === "produto" && <Button variant="ghost" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(result); setCopied(true); } catch { setError("Não foi possível copiar."); } }}><Copy />{copied ? "Copiado" : "Copiar"}</Button>}<Button variant="outline" size="sm" onClick={download}><Download />Baixar {config.extension.toUpperCase()}</Button></div>}</div>
        {error && <p role="alert" className="mt-5 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
        {busy ? <div role="status" className="flex min-h-80 items-center justify-center gap-3 text-muted-foreground"><Sparkles className="animate-pulse text-primary" />Gerando…</div> : result ? <div className="mt-5">{mode === "audio" ? <audio src={result} controls className="w-full" /> : mode === "banner" ? <img src={result} alt="Banner gerado para a campanha" className="max-h-[600px] w-full rounded-md object-contain" /> : mode === "produto" ? <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">{result}</pre> : <iframe title={config.result} srcDoc={result} sandbox={mode === "quiz" ? "allow-scripts" : ""} referrerPolicy="no-referrer" className="h-[600px] w-full rounded-md border border-border" />}</div> : !error && <div className="flex min-h-80 items-center justify-center"><Icon className="h-16 w-16 text-muted-foreground/30" /></div>}
      </section>
    </div>
  </main></div>;
}