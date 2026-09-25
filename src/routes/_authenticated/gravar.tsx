import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { criarVideo, consultarVideo, gerarTexto } from "@/lib/ai.functions";
import { produtos } from "@/lib/tarte-data";

export const Route = createFileRoute("/_authenticated/gravar")({
  head: () => ({
    meta: [
      { title: "Gravar e postar seu vídeo — T@arte" },
      {
        name: "description",
        content:
          "Grave seu vídeo mostrando o rosto com teleprompter, ou crie um avatar com inteligência artificial, e compartilhe direto no WhatsApp, TikTok e Instagram.",
      },
      { property: "og:title", content: "Grave e poste seu vídeo — T@arte" },
      {
        property: "og:description",
        content: "Câmera com teleprompter, avatares com IA e compartilhamento em um toque.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gravar,
});

const avatares = [
  {
    id: "a1",
    nome: "Bia — amiga sincera",
    descricao:
      "mulher brasileira de 28 anos, cabelo castanho ondulado, camiseta branca, sorriso simpático, falando direto para a câmera em uma sala clara com plantas ao fundo",
  },
  {
    id: "a2",
    nome: "Rafa — direto ao ponto",
    descricao:
      "homem brasileiro de 32 anos, barba curta, camiseta preta, falando com energia para a câmera em um quarto com luz neon roxa ao fundo",
  },
  {
    id: "a3",
    nome: "Dona Cléo — depoimento real",
    descricao:
      "mulher brasileira de 55 anos, cabelo curto grisalho, blusa florida, falando com carinho para a câmera na cozinha de casa com luz natural",
  },
  {
    id: "a4",
    nome: "Duda — jovem viral",
    descricao:
      "jovem brasileira de 21 anos, cabelo preso, blusa colorida, falando animada para a câmera em um quarto com pelúcias e luz rosa",
  },
];

type Aba = "camera" | "avatar";

function Gravar() {
  const [aba, setAba] = useState<Aba>("camera");
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Grave e poste seu vídeo</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Grave mostrando o seu rosto com o texto rolando na tela, ou deixe um avatar de
          inteligência artificial falar por você. Depois compartilhe no WhatsApp e nas suas redes.
        </p>

        <div className="mt-5 inline-flex rounded-full border border-border bg-secondary/40 p-1">
          {(
            [
              ["camera", "Gravar com meu rosto"],
              ["avatar", "Usar um avatar de IA"],
            ] as const
          ).map(([valor, rotulo]) => (
            <button
              key={valor}
              onClick={() => setAba(valor)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                aba === valor ? "bg-gradient-neon text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <div className="mt-6">{aba === "camera" ? <ModoCamera /> : <ModoAvatar />}</div>
      </div>
    </div>
  );
}

function Compartilhar({
  url,
  nomeArquivo,
  legenda,
}: {
  url: string;
  nomeArquivo: string;
  legenda: string;
}) {
  const [aviso, setAviso] = useState<string | null>(null);

  const compartilhar = async () => {
    try {
      const blob = await (await fetch(url)).blob();
      const arquivo = new File([blob], nomeArquivo, { type: blob.type || "video/mp4" });
      const nav = navigator as Navigator & {
        canShare?: (dados: { files?: File[] }) => boolean;
      };
      if (nav.share && nav.canShare?.({ files: [arquivo] })) {
        await nav.share({ files: [arquivo], text: legenda, title: "Meu vídeo T@arte" });
        return;
      }
      setAviso("Seu aparelho não abre o compartilhamento direto. Baixe o vídeo e poste do celular.");
    } catch {
      setAviso("Não foi possível abrir o compartilhamento. Baixe o vídeo e poste do celular.");
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={compartilhar}
          className="rounded-full bg-gradient-neon px-4 py-2 text-[13px] font-semibold text-primary-foreground"
        >
          Compartilhar nas redes
        </button>
        <a
          href={url}
          download={nomeArquivo}
          className="rounded-full border border-border px-4 py-2 text-[13px] font-semibold"
        >
          Baixar vídeo
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(legenda)}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-border px-4 py-2 text-[13px] font-semibold"
        >
          Enviar legenda no WhatsApp
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(legenda)}
          className="rounded-full border border-border px-4 py-2 text-[13px] font-semibold"
        >
          Copiar legenda
        </button>
      </div>
      {aviso && <p className="text-[12.5px] text-muted-foreground">{aviso}</p>}
    </div>
  );
}

function ModoCamera() {
  const escrever = useServerFn(gerarTexto);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const gravadorRef = useRef<MediaRecorder | null>(null);
  const pedacosRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [ligada, setLigada] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [gravado, setGravado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [produtoNome, setProdutoNome] = useState(produtos[0]!.nome);
  const [texto, setTexto] = useState("");
  const [escrevendo, setEscrevendo] = useState(false);
  const [rolando, setRolando] = useState(false);
  const [velocidade, setVelocidade] = useState(40);
  const prompterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!gravando) return;
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [gravando]);

  useEffect(() => {
    if (!rolando) return;
    const id = setInterval(() => {
      const el = prompterRef.current;
      if (el) el.scrollTop += 1;
    }, Math.max(10, 120 - velocidade));
    return () => clearInterval(id);
  }, [rolando, velocidade]);

  const ligarCamera = async () => {
    setErro(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setLigada(true);
    } catch {
      setErro("Não conseguimos acessar sua câmera. Permita o acesso no navegador e tente de novo.");
    }
  };

  const iniciar = () => {
    const stream = streamRef.current;
    if (!stream) return;
    pedacosRef.current = [];
    setGravado(null);
    setSegundos(0);
    const tipos = ["video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
    const tipo = tipos.find((t) => MediaRecorder.isTypeSupported(t));
    const gravador = new MediaRecorder(stream, tipo ? { mimeType: tipo } : undefined);
    gravador.ondataavailable = (e) => {
      if (e.data.size > 0) pedacosRef.current.push(e.data);
    };
    gravador.onstop = () => {
      const blob = new Blob(pedacosRef.current, { type: gravador.mimeType || "video/webm" });
      setGravado(URL.createObjectURL(blob));
      setRolando(false);
    };
    gravadorRef.current = gravador;
    gravador.start();
    setGravando(true);
    setRolando(true);
  };

  const parar = () => {
    gravadorRef.current?.stop();
    setGravando(false);
  };

  const escreverTexto = async () => {
    setEscrevendo(true);
    setErro(null);
    try {
      const produto = produtos.find((p) => p.nome === produtoNome);
      const r = await escrever({
        data: {
          sistema:
            "Você escreve falas para o criador ler na câmera. Responda apenas com a fala corrida, em português do Brasil, frases curtas, sem títulos, sem marcações de tempo e sem listas.",
          pedido: `Escreva a fala de um vídeo de 30 segundos falando na câmera sobre o produto "${produtoNome}"${
            produto ? ` (preço R$ ${produto.preco.toFixed(2).replace(".", ",")})` : ""
          } para TikTok Shop. Comece com um gancho forte, mostre o benefício, quebre a objeção de preço e termine chamando para clicar no carrinho.`,
        },
      });
      setTexto(r.texto);
      if (prompterRef.current) prompterRef.current.scrollTop = 0;
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível escrever a fala agora.");
    } finally {
      setEscrevendo(false);
    }
  };

  const minutos = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(
    segundos % 60,
  ).padStart(2, "0")}`;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div className="glass rounded-2xl p-5">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-2xl bg-secondary">
          <video
            ref={videoRef}
            muted
            playsInline
            className="h-full w-full scale-x-[-1] object-cover"
          />
          {!ligada && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-[13.5px] text-muted-foreground">
                Ligue a câmera para gravar seu vídeo mostrando o rosto.
              </p>
              <button
                onClick={ligarCamera}
                className="rounded-full bg-gradient-neon px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Ligar câmera
              </button>
            </div>
          )}
          {ligada && texto && (
            <div
              ref={prompterRef}
              className="absolute inset-x-0 bottom-0 max-h-[45%] overflow-y-auto bg-background/70 px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap backdrop-blur"
            >
              {texto}
            </div>
          )}
          {gravando && (
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-[12px] font-semibold backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
              {minutos}
            </div>
          )}
        </div>

        {ligada && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {!gravando ? (
              <button
                onClick={iniciar}
                className="rounded-full bg-gradient-neon px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                {gravado ? "Gravar de novo" : "Começar a gravar"}
              </button>
            ) : (
              <button
                onClick={parar}
                className="rounded-full border border-destructive px-5 py-2.5 text-sm font-semibold text-destructive"
              >
                Parar gravação
              </button>
            )}
            {texto && (
              <button
                onClick={() => setRolando((r) => !r)}
                className="rounded-full border border-border px-4 py-2 text-[13px] font-semibold"
              >
                {rolando ? "Pausar texto" : "Rolar texto"}
              </button>
            )}
          </div>
        )}

        {erro && (
          <p className="mt-4 rounded-xl border border-destructive/40 px-4 py-3 text-[13.5px] text-destructive">
            {erro}
          </p>
        )}

        {gravado && (
          <div className="mt-5">
            <h3 className="font-display text-base font-semibold">Seu vídeo gravado</h3>
            <video src={gravado} controls playsInline className="mt-2 w-full rounded-xl" />
            <Compartilhar
              url={gravado}
              nomeArquivo="tarte-meu-video.webm"
              legenda={`${produtoNome} — achei e testei! Corre que tá em promoção no carrinho 🛒 #tiktokshop #achadinhos`}
            />
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-display text-base font-semibold">Texto pra você ler</h3>
        <label className="mt-4 block text-xs text-muted-foreground">Produto</label>
        <input
          value={produtoNome}
          onChange={(e) => setProdutoNome(e.target.value)}
          list="lista-produtos-gravar"
          className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <datalist id="lista-produtos-gravar">
          {produtos.map((p) => (
            <option key={p.id} value={p.nome} />
          ))}
        </datalist>

        <button
          onClick={escreverTexto}
          disabled={escrevendo}
          className="mt-3 w-full rounded-full bg-gradient-neon py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {escrevendo ? "Escrevendo…" : "Escrever fala com IA"}
        </button>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={10}
          placeholder="A fala aparece aqui e rola na tela enquanto você grava. Você também pode escrever a sua."
          className="mt-3 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
        />

        <label className="mt-4 block text-xs text-muted-foreground">
          Velocidade do texto na tela
        </label>
        <input
          type="range"
          min={10}
          max={100}
          value={velocidade}
          onChange={(e) => setVelocidade(Number(e.target.value))}
          className="mt-2 w-full"
        />
      </div>
    </div>
  );
}

function ModoAvatar() {
  const criar = useServerFn(criarVideo);
  const consultar = useServerFn(consultarVideo);
  const escrever = useServerFn(gerarTexto);

  const [avatarId, setAvatarId] = useState(avatares[0]!.id);
  const [fala, setFala] = useState("");
  const [duracao, setDuracao] = useState("8s");
  const [video, setVideo] = useState<string | null>(null);
  const [estado, setEstado] = useState<"parado" | "criando" | "escrevendo">("parado");
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  const avatar = avatares.find((a) => a.id === avatarId)!;

  const escreverFala = async () => {
    setEstado("escrevendo");
    setErro(null);
    try {
      const produto = produtos[Math.floor(Math.random() * produtos.length)]!;
      const r = await escrever({
        data: {
          sistema:
            "Você escreve falas curtas para vídeos de até 8 segundos. Responda com no máximo 2 frases em português do Brasil, sem títulos e sem aspas.",
          pedido: `Escreva a fala de abertura de um vídeo vendendo "${produto.nome}" no TikTok Shop.`,
        },
      });
      setFala(r.texto);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível escrever a fala.");
    } finally {
      setEstado("parado");
    }
  };

  const gerar = async () => {
    setEstado("criando");
    setErro(null);
    setVideo(null);
    setProgresso(0);
    try {
      const { id } = await criar({
        data: {
          pedido: `Vídeo vertical em plano único, sem cortes: ${avatar.descricao}. A pessoa olha para a câmera e diz: ${fala}. Fala em português do Brasil, som limpo, sem música alta, sem texto na tela.`,
          duracao,
          formato: "9:16",
        },
      });
      for (let tentativa = 0; tentativa < 90; tentativa++) {
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
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <div className="glass rounded-2xl p-5">
        <h3 className="font-display text-base font-semibold">Escolha o avatar</h3>
        <div className="mt-3 space-y-2">
          {avatares.map((a) => (
            <button
              key={a.id}
              onClick={() => setAvatarId(a.id)}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-left text-[13.5px] transition-colors ${
                avatarId === a.id
                  ? "border-primary bg-secondary/60"
                  : "border-border text-muted-foreground"
              }`}
            >
              {a.nome}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs text-muted-foreground">Fala do avatar</label>
        <textarea
          value={fala}
          onChange={(e) => setFala(e.target.value)}
          rows={4}
          placeholder="ex: Comprei sem esperança e virou meu favorito. Corre no carrinho antes que acabe!"
          className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={escreverFala}
          disabled={estado !== "parado"}
          className="mt-2 text-[13px] font-semibold text-primary disabled:opacity-60"
        >
          {estado === "escrevendo" ? "Escrevendo…" : "Escrever fala com IA"}
        </button>

        <label className="mt-4 block text-xs text-muted-foreground">Duração</label>
        <select
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {["5s", "6s", "8s", "10s"].map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <button
          onClick={gerar}
          disabled={criando || fala.trim().length < 8}
          className="mt-5 w-full rounded-full bg-gradient-neon py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {criando ? "Criando vídeo…" : "Gerar vídeo do avatar"}
        </button>
        <p className="mt-2 text-[12px] text-muted-foreground">
          O avatar leva de 1 a 3 minutos pra ficar pronto. Deixe esta página aberta.
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold">Vídeo do avatar</h3>

        {erro && (
          <p className="mt-4 rounded-xl border border-destructive/40 px-4 py-3 text-[13.5px] text-destructive">
            {erro}
          </p>
        )}

        {!erro && criando && (
          <div className="mt-4 space-y-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-neon transition-all"
                style={{ width: `${Math.max(progresso, 8)}%` }}
              />
            </div>
            <p className="text-[13px] text-primary">
              O avatar está sendo gravado pela inteligência artificial… {progresso}%
            </p>
          </div>
        )}

        {!erro && !criando && video && (
          <div className="mt-4">
            <video src={video} controls playsInline className="mx-auto max-h-[65vh] rounded-xl" />
            <Compartilhar
              url={video}
              nomeArquivo="tarte-avatar.mp4"
              legenda={`${fala.slice(0, 120)} 🛒 #tiktokshop #achadinhos`}
            />
          </div>
        )}

        {!erro && !criando && !video && (
          <p className="mt-4 text-sm text-muted-foreground">
            Escolha o avatar, escreva a fala e clique em gerar.
          </p>
        )}
      </div>
    </div>
  );
}
