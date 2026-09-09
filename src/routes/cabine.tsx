import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { provarRoupa } from "@/lib/ai.functions";

export const Route = createFileRoute("/cabine")({
  head: () => ({
    meta: [
      { title: "Cabine de troca de roupas com IA — T@arte" },
      {
        name: "description",
        content:
          "Envie sua foto e a peça do TikTok Shop: a inteligência artificial veste a roupa em você para gravar vídeos sem receber o produto.",
      },
      { property: "og:title", content: "Cabine de troca de roupas com IA — T@arte" },
      {
        property: "og:description",
        content: "Prova virtual de roupas para criar conteúdo de moda em minutos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cabine,
});

function lerArquivo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    fr.readAsDataURL(file);
  });
}

function Cabine() {
  const provar = useServerFn(provarRoupa);
  const [pessoa, setPessoa] = useState<string | null>(null);
  const [roupa, setRoupa] = useState<string | null>(null);
  const [instrucao, setInstrucao] = useState("");
  const [resultado, setResultado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async () => {
    if (!pessoa) {
      setErro("Envie primeiro uma foto sua de corpo inteiro.");
      return;
    }
    if (!roupa && instrucao.trim().length < 4) {
      setErro("Envie a foto da peça ou descreva a roupa que quer vestir.");
      return;
    }
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      const r = await provar({
        data: { pessoa, roupa: roupa ?? undefined, instrucao },
      });
      setResultado(r.imagem);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível provar a roupa agora.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Cabine de troca de roupas</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] text-muted-foreground">
          Envie uma foto sua de corpo inteiro e a foto da peça do TikTok Shop. A inteligência
          artificial veste a roupa em você — dá pra gravar conteúdo antes do produto chegar.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[380px_1fr]">
          <div className="glass rounded-2xl p-5">
            <label className="text-xs text-muted-foreground">Sua foto (corpo inteiro)</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setPessoa(await lerArquivo(f));
              }}
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-[13px] file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-foreground"
            />
            {pessoa && (
              <img
                src={pessoa}
                alt="Sua foto enviada"
                className="mt-3 h-40 w-full rounded-xl object-cover"
              />
            )}

            <label className="mt-4 block text-xs text-muted-foreground">
              Foto da peça (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setRoupa(await lerArquivo(f));
              }}
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-[13px] file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-foreground"
            />
            {roupa && (
              <img
                src={roupa}
                alt="Peça de roupa enviada"
                className="mt-3 h-40 w-full rounded-xl object-contain"
              />
            )}

            <label className="mt-4 block text-xs text-muted-foreground">
              Descreva a roupa ou o ajuste
            </label>
            <textarea
              value={instrucao}
              onChange={(e) => setInstrucao(e.target.value)}
              rows={3}
              placeholder="ex: vestido preto de festa, justo, com salto"
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />

            <button
              onClick={enviar}
              disabled={carregando}
              className="mt-5 w-full rounded-full bg-gradient-neon py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {carregando ? "Provando a roupa…" : "Provar a roupa"}
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              Suas fotos são usadas só para gerar esta imagem.
            </p>
          </div>

          <div className="glass flex min-h-[420px] items-center justify-center rounded-2xl p-6">
            {carregando && (
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-secondary border-t-primary" />
                <p className="mt-4 text-[13px] text-primary">
                  Vestindo a peça… isso leva alguns segundos.
                </p>
              </div>
            )}
            {!carregando && erro && (
              <p className="rounded-xl border border-destructive/40 px-4 py-3 text-center text-[13.5px] text-destructive">
                {erro}
              </p>
            )}
            {!carregando && !erro && resultado && (
              <div className="w-full">
                <img
                  src={resultado}
                  alt="Prova virtual gerada pela inteligência artificial"
                  className="mx-auto max-h-[520px] rounded-2xl"
                />
                <div className="mt-4 text-center">
                  <a
                    href={resultado}
                    download="tarte-cabine.png"
                    className="inline-block rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
                  >
                    Baixar imagem
                  </a>
                </div>
              </div>
            )}
            {!carregando && !erro && !resultado && (
              <p className="max-w-sm text-center text-sm text-muted-foreground">
                O resultado da prova aparece aqui. Use foto de frente, com boa luz e corpo inteiro.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
