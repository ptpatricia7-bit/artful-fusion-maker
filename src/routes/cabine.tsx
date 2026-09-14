import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Box,
  Camera,
  Download,
  ImagePlus,
  PackageOpen,
  Shirt,
  Sparkles,
  UserRoundCog,
  WandSparkles,
} from "lucide-react";
import { useState, type ComponentType } from "react";
import { AppNav } from "@/components/AppNav";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { gerarImagemEstudio } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cabine")({
  head: () => ({
    meta: [
      { title: "Estúdio visual com IA — T@arte" },
      {
        name: "description",
        content:
          "Crie fotos profissionais e 3D, troque roupas e personagens, produza fotos de produtos e restaure imagens com inteligência artificial.",
      },
      { property: "og:title", content: "Estúdio visual com IA — T@arte" },
      {
        property: "og:description",
        content: "Seis ferramentas de imagem em um estúdio visual completo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cabine,
});

type Modo = "roupa" | "profissional" | "tres-d" | "personagem" | "produto" | "restauracao";

type Ferramenta = {
  id: Modo;
  nome: string;
  resumo: string;
  imagemLabel: string;
  referenciaLabel?: string;
  instrucaoLabel: string;
  placeholder: string;
  acao: string;
  carregando: string;
  Icone: ComponentType<{ className?: string }>;
};

const ferramentas = [
  {
    id: "roupa",
    nome: "Troca de roupas",
    resumo: "Vista qualquer peça preservando seu rosto, corpo e cenário.",
    imagemLabel: "Foto da pessoa (corpo inteiro)",
    referenciaLabel: "Foto da roupa (opcional)",
    instrucaoLabel: "Roupa ou ajuste desejado",
    placeholder: "Ex.: vestido preto de festa, justo, com salto",
    acao: "Provar roupa",
    carregando: "Vestindo a peça com acabamento realista…",
    Icone: Shirt,
  },
  {
    id: "profissional",
    nome: "Foto profissional",
    resumo: "Converta uma foto comum em um ensaio com luz de estúdio.",
    imagemLabel: "Foto que deseja melhorar",
    instrucaoLabel: "Estilo do ensaio",
    placeholder: "Ex.: retrato corporativo elegante, fundo cinza e luz suave",
    acao: "Criar foto profissional",
    carregando: "Montando iluminação e acabamento de estúdio…",
    Icone: Camera,
  },
  {
    id: "tres-d",
    nome: "Foto 3D",
    resumo: "Crie profundidade, volume e materiais em uma arte tridimensional.",
    imagemLabel: "Imagem que deseja transformar",
    instrucaoLabel: "Estilo 3D desejado",
    placeholder: "Ex.: personagem 3D premium, acabamento brilhante e luz cinematográfica",
    acao: "Transformar em 3D",
    carregando: "Criando volumes, materiais e profundidade…",
    Icone: Box,
  },
  {
    id: "personagem",
    nome: "Troca de personagem",
    resumo: "Transforme a pessoa sem perder sua identidade e expressão.",
    imagemLabel: "Foto da pessoa",
    referenciaLabel: "Personagem de referência (opcional)",
    instrucaoLabel: "Personagem desejado",
    placeholder: "Ex.: apresentadora futurista com figurino prateado",
    acao: "Trocar personagem",
    carregando: "Criando o personagem e preservando a identidade…",
    Icone: UserRoundCog,
  },
  {
    id: "produto",
    nome: "Foto de produto",
    resumo: "Produza uma imagem publicitária pronta para vender nas redes.",
    imagemLabel: "Foto do produto",
    referenciaLabel: "Cenário ou estilo de referência (opcional)",
    instrucaoLabel: "Cenário desejado",
    placeholder: "Ex.: bancada de mármore, luz dourada e aparência premium",
    acao: "Criar foto de produto",
    carregando: "Preparando cenário e iluminação publicitária…",
    Icone: PackageOpen,
  },
  {
    id: "restauracao",
    nome: "Restauração",
    resumo: "Recupere fotos antigas, riscadas, desbotadas ou pouco nítidas.",
    imagemLabel: "Foto antiga ou danificada",
    instrucaoLabel: "Ajuste adicional (opcional)",
    placeholder: "Ex.: manter em preto e branco e recuperar os detalhes dos rostos",
    acao: "Restaurar imagem",
    carregando: "Recuperando detalhes e removendo danos…",
    Icone: WandSparkles,
  },
] as const satisfies readonly Ferramenta[];

function lerArquivo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    fr.readAsDataURL(file);
  });
}

function Cabine() {
  const gerar = useServerFn(gerarImagemEstudio);
  const [modo, setModo] = useState<Modo>("roupa");
  const [imagem, setImagem] = useState<string | null>(null);
  const [referencia, setReferencia] = useState<string | null>(null);
  const [instrucao, setInstrucao] = useState("");
  const [resultado, setResultado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const ferramenta = ferramentas.find((item) => item.id === modo) ?? ferramentas[0];

  const trocarModo = (novoModo: Modo) => {
    setModo(novoModo);
    setImagem(null);
    setReferencia(null);
    setInstrucao("");
    setResultado(null);
    setErro(null);
  };

  const enviar = async () => {
    if (!imagem) {
      setErro("Envie a imagem principal para começar.");
      return;
    }
    if ((modo === "roupa" || modo === "personagem") && !referencia && instrucao.trim().length < 4) {
      setErro("Envie uma referência ou descreva o resultado que deseja.");
      return;
    }
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      const resposta = await gerar({
        data: { modo, imagem, referencia: referencia ?? undefined, instrucao },
      });
      setResultado(resposta.imagem);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível criar a imagem agora.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 py-8 md:py-10">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Estúdio visual com IA</h1>
            <p className="mt-1 max-w-2xl text-[13.5px] text-muted-foreground">
              Escolha uma ferramenta, envie sua imagem e crie material profissional para suas redes.
            </p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6" role="tablist" aria-label="Ferramentas do estúdio">
          {ferramentas.map(({ id, nome, Icone }) => (
            <Button
              key={id}
              type="button"
              role="tab"
              aria-selected={modo === id}
              variant="ghost"
              onClick={() => trocarModo(id)}
              className={cn(
                "h-auto min-h-20 flex-col whitespace-normal border px-3 py-3 text-center",
                modo === id
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-surface text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icone className="h-5 w-5" />
              <span className="text-xs leading-tight">{nome}</span>
            </Button>
          ))}
        </div>

        <section className="mt-4 grid overflow-hidden rounded-lg border border-border bg-card lg:grid-cols-[390px_1fr]">
          <div className="border-b border-border p-5 lg:border-r lg:border-b-0">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <ferramenta.Icone className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">{ferramenta.nome}</h2>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{ferramenta.resumo}</p>
            </div>

            <UploadImagem
              label={ferramenta.imagemLabel}
              valor={imagem}
              onChange={setImagem}
              alt="Imagem principal enviada"
            />

            {ferramenta.referenciaLabel && (
              <div className="mt-4">
                <UploadImagem
                  label={ferramenta.referenciaLabel}
                  valor={referencia}
                  onChange={setReferencia}
                  alt="Imagem de referência enviada"
                  compacta
                />
              </div>
            )}

            <label className="mt-4 block text-xs font-medium text-muted-foreground">
              {ferramenta.instrucaoLabel}
            </label>
            <textarea
              value={instrucao}
              onChange={(e) => setInstrucao(e.target.value)}
              rows={3}
              placeholder={ferramenta.placeholder}
              className="mt-1.5 w-full resize-none rounded-md border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
            />

            <Button onClick={enviar} disabled={carregando} className="mt-5 h-11 w-full font-semibold">
              <WandSparkles className="h-4 w-4" />
              {carregando ? "Criando…" : ferramenta.acao}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Suas imagens são usadas somente para criar este resultado.
            </p>
          </div>

          <div className="flex min-h-[480px] items-center justify-center bg-background/40 p-5 md:p-8">
            {carregando && (
              <div className="max-w-sm text-center" aria-live="polite">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-primary/30 bg-primary/10">
                  <Sparkles className="h-6 w-6 animate-pulse text-primary" />
                </div>
                <p className="mt-4 text-sm font-medium">{ferramenta.carregando}</p>
                <p className="mt-1 text-xs text-muted-foreground">A imagem aparecerá aqui quando estiver pronta.</p>
              </div>
            )}
            {!carregando && erro && (
              <p className="max-w-md rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-center text-[13.5px] text-destructive" role="alert">
                {erro}
              </p>
            )}
            {!carregando && !erro && resultado && (
              <div className="w-full text-center">
                <img
                  src={resultado}
                  alt={`Resultado de ${ferramenta.nome.toLowerCase()} criado pela inteligência artificial`}
                  className="mx-auto max-h-[560px] max-w-full rounded-lg object-contain"
                />
                <Button asChild variant="outline" className="mt-4">
                  <a href={resultado} download={`tarte-${modo}.png`}>
                    <Download className="h-4 w-4" />
                    Baixar imagem
                  </a>
                </Button>
              </div>
            )}
            {!carregando && !erro && !resultado && (
              <div className="max-w-sm text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-border bg-surface">
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium">Seu resultado aparecerá aqui</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Use uma imagem nítida e bem iluminada para conseguir um acabamento melhor.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function UploadImagem({
  label,
  valor,
  onChange,
  alt,
  compacta = false,
}: {
  label: string;
  valor: string | null;
  onChange: (valor: string | null) => void;
  alt: string;
  compacta?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input bg-secondary/30 px-3 py-3 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground">
        <ImagePlus className="h-4 w-4" />
        {valor ? "Trocar imagem" : "Escolher imagem"}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (e) => {
            const arquivo = e.target.files?.[0];
            if (arquivo) onChange(await lerArquivo(arquivo));
          }}
        />
      </label>
      {valor && (
        <div className="relative mt-2 overflow-hidden rounded-md border border-border bg-background">
          <img src={valor} alt={alt} className={cn("w-full object-contain", compacta ? "h-28" : "h-40")} />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 h-7"
          >
            Remover
          </Button>
        </div>
      )}
    </div>
  );
}