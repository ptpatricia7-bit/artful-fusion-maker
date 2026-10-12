import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCheck, Download, MessageCircle, Mic, Moon, Paperclip, Plus, Send, Smile, Sparkles, Sun, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { gerarTexto } from "@/lib/ai.functions";

type Message = { id: string; outgoing: boolean; text: string };
const initialMessages: Message[] = [
  { id: "1", outgoing: false, text: "Olá! Gostaria de saber mais sobre o produto." },
  { id: "2", outgoing: true, text: "Olá! Claro, qual é a sua dúvida?" },
  { id: "3", outgoing: false, text: "Como funciona e onde encontro os detalhes?" },
];

export function ConversationGenerator() {
  const generateText = useServerFn(gerarTexto);
  const [name, setName] = useState("Contato exemplo");
  const [group, setGroup] = useState(false);
  const [light, setLight] = useState(true);
  const [description, setDescription] = useState("");
  const [count, setCount] = useState(3);
  const [prints, setPrints] = useState(1);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const previews = useRef<(HTMLDivElement | null)[]>([]);
  const update = (id: string, patch: Partial<Message>) => setMessages((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  const useTemplate = () => {
    const subject = description.trim() || "o produto ou serviço";
    setMessages(Array.from({ length: count * prints }, (_, i) => ({ id: crypto.randomUUID(), outgoing: i % 2 === 1, text: [
      `Olá! Pode me contar mais sobre ${subject}?`,
      "Claro! Qual informação você gostaria de saber?",
      "Gostaria de conhecer as opções disponíveis.",
      "Vamos conversar sobre a opção que combina com você.",
      "Onde posso conferir os detalhes?",
      "Posso compartilhar as informações por aqui.",
    ][i % 6] ?? "Olá!" })));
    setError("");
  };
  const generate = async () => {
    if (description.trim().length < 3) { setError("Descreva o produto ou serviço."); return; }
    setBusy(true); setError("");
    try {
      const result = await generateText({ data: { sistema: "Escreva uma conversa FICTÍCIA de atendimento para uma maquete do WhatsApp, em português. Não invente depoimentos, resultados de uso, compras, preços ou promessas. Retorne somente as falas, uma por linha, alternando cliente e atendente, sem nomes ou numeração.", pedido: `Assunto: ${description}. Gere exatamente ${count * prints} mensagens curtas. A primeira fala é do cliente. Cada fala tem até 160 caracteres.` } });
      if (result.erro) throw new Error(result.erro);
      const lines = result.texto.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, count * prints);
      if (!lines.length) throw new Error("Não foi possível criar a conversa.");
      setMessages(lines.map((text, i) => ({ id: crypto.randomUUID(), outgoing: i % 2 === 1, text: text.slice(0, 500) })));
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível gerar agora."); }
    finally { setBusy(false); }
  };
  const download = async (index: number) => {
    const element = previews.current[index];
    if (!element) return;
    setDownloading(true); setError("");
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(element, { pixelRatio: 2, cacheBust: true, skipFonts: true });
      const link = document.createElement("a"); link.download = `tarte-conversa-simulacao-${index + 1}.png`; link.href = url; link.click();
    } catch { setError("Não foi possível baixar a imagem. Tente novamente."); }
    finally { setDownloading(false); }
  };
  const batches = Array.from({ length: prints }, (_, i) => messages.slice(i * count, (i + 1) * count));
  const field = "mt-2 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
  return <div className="min-h-screen"><SiteHeader /><AppNav /><main className="mx-auto max-w-6xl px-5 py-10">
    <div className="flex items-center gap-3"><MessageCircle className="h-7 w-7 text-primary" /><h1 className="font-display text-3xl font-bold">Gerador de Conversas</h1></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <div className="min-w-0 space-y-6">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold">Configurações</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm text-muted-foreground">Plataforma<input value="WhatsApp" readOnly className={field} /></label><div><p className="text-sm text-muted-foreground">Tipo</p><div className="mt-2 flex gap-2"><Button variant={!group ? "secondary" : "outline"} onClick={() => setGroup(false)} aria-pressed={!group}><MessageCircle />Individual</Button><Button variant={group ? "secondary" : "outline"} onClick={() => setGroup(true)} aria-pressed={group}><Users />Grupo</Button></div></div></div>
          <label className="mt-5 block text-sm text-muted-foreground">{group ? "Nome do grupo" : "Nome do contato"}<input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className={field} /></label>
          <label className="mt-5 block text-sm text-muted-foreground">Descreva seu produto / serviço<textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={3} placeholder="Ex.: curso de marketing digital para iniciantes" className={field} /></label>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm text-muted-foreground">Mensagens por print: {count}<input type="range" min={2} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-3 w-full accent-primary" /></label><label className="text-sm text-muted-foreground">Quantidade de prints: {prints}<input type="range" min={1} max={4} value={prints} onChange={(e) => setPrints(Number(e.target.value))} className="mt-3 w-full accent-primary" /></label></div>
          <p className="mt-5 text-sm text-muted-foreground">Tema do print</p><div className="mt-2 flex gap-2"><Button variant={!light ? "secondary" : "outline"} onClick={() => setLight(false)} aria-pressed={!light}><Moon />Escuro</Button><Button variant={light ? "secondary" : "outline"} onClick={() => setLight(true)} aria-pressed={light}><Sun />Claro</Button></div>
          <div className="mt-6 flex flex-wrap gap-3"><Button variant="outline" onClick={useTemplate}>Usar modelo</Button><Button onClick={generate} disabled={busy}><Sparkles />{busy ? "Gerando…" : "Gerar conversa com IA"}</Button></div>
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        </section>
        <section><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Mensagens</h2><Button size="sm" variant="outline" disabled={messages.length >= 40} onClick={() => setMessages((items) => [...items, { id: crypto.randomUUID(), text: "", outgoing: false }])}><Plus />Adicionar</Button></div>
          <div className="mt-4 space-y-3">{messages.map((message, index) => <div key={message.id} className="rounded-lg border border-border bg-card p-3"><div className="flex items-center justify-between"><label className="text-xs text-muted-foreground">Mensagem {index + 1}<select aria-label={`Remetente da mensagem ${index + 1}`} value={message.outgoing ? "outgoing" : "incoming"} onChange={(e) => update(message.id, { outgoing: e.target.value === "outgoing" })} className="ml-3 rounded-md border border-input bg-secondary px-2 py-1 text-foreground"><option value="incoming">{group ? "Participante" : "Contato"}</option><option value="outgoing">Você</option></select></label><Button size="icon" variant="ghost" title="Remover mensagem" aria-label={`Remover mensagem ${index + 1}`} onClick={() => setMessages((items) => items.filter((item) => item.id !== message.id))}><Trash2 /></Button></div><textarea aria-label={`Texto da mensagem ${index + 1}`} rows={2} maxLength={500} value={message.text} onChange={(e) => update(message.id, { text: e.target.value })} className={field} /></div>)}</div>
        </section>
      </div>
      <section className="min-w-0"><h2 className="mb-4 flex items-center gap-2 font-semibold"><MessageCircle className="h-4 w-4" />Prévia — WhatsApp</h2><div className="space-y-6">{batches.map((batch, index) => <div key={index}>
        <div ref={(element) => { previews.current[index] = element; }} className={`conversation-print ${light ? "conversation-light" : "conversation-dark"} overflow-hidden rounded-lg border border-border`}>
          <div className="conversation-header flex items-center gap-3 px-4 py-4"><ArrowLeft className="h-5 w-5 shrink-0" /><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">{group ? <Users className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{name || "Contato exemplo"}</p><p className="text-xs opacity-80">{group ? "Grupo fictício" : "Conversa fictícia"}</p></div></div>
          <div className="conversation-watermark px-3 py-2 text-center text-xs font-bold">SIMULAÇÃO · NÃO É UMA CONVERSA REAL</div>
          <div className="flex min-h-80 flex-col gap-3 px-4 py-6">{batch.map((message) => <div key={message.id} className={`conversation-bubble max-w-[88%] rounded-md px-3 py-2 ${message.outgoing ? "conversation-outgoing self-end" : "conversation-incoming self-start"}`}>
            {group && !message.outgoing && <p className="mb-1 text-xs font-bold">Participante exemplo</p>}<p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">{message.text || "…"}</p><div className="mt-1 flex justify-end gap-1 text-[10px] opacity-70">10:30{message.outgoing && <CheckCheck className="h-3 w-3" />}</div>
          </div>)}</div>
          <div className="conversation-input mx-3 mb-3 flex items-center gap-3 rounded-full px-3 py-3 text-xs"><Smile className="h-4 w-4" /><span className="flex-1">Mensagem</span><Paperclip className="h-4 w-4" /><Mic className="h-4 w-4" /></div>
          <div className="conversation-watermark py-2 text-center text-[10px] font-semibold">T@arte · Exemplo ilustrativo</div>
        </div><Button className="mt-3 w-full" variant="outline" disabled={downloading || !batch.length} onClick={() => download(index)}><Download />{downloading ? "Baixando…" : `Baixar print ${index + 1}`}</Button>
      </div>)}</div></section>
    </div>
  </main></div>;
}