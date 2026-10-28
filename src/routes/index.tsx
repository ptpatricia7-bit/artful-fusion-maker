import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import painelAsset from "@/assets/tarte-roupa.png.asset.json";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { videosVirais, produtos, brl, faq } from "@/lib/tarte-data";

const painelImageUrl = `https://artful-fusion-maker.lovable.app${painelAsset.url}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "T@arte — Veja o que está em alta no TikTok Shop Brasil" },
      {
        name: "description",
        content:
          "Descubra produtos em alta no TikTok Shop Brasil e crie roteiros e vídeos com IA para postar todo dia.",
      },
      { property: "og:title", content: "T@arte — o que está vendendo agora no TikTok Shop BR" },
      {
        property: "og:description",
        content:
          "Produtos em alta, roteiros e vídeos com inteligência artificial para redes sociais.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: painelImageUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: painelImageUrl },
    ],
  }),
  component: Home,
});

const dores = [
  "Vídeos que não passam de 1.000 visualizações",
  "Produtos escolhidos no achismo que não vendem 1 unidade",
  "Meses tentando descobrir sozinho o que funciona",
  "Conteúdo gerado com IA no escuro que só dá flop",
];

const praQuem = [
  { t: "Criador de conteúdo", d: "Quer parar de gravar no escuro e postar todo dia com produto validado." },
  { t: "Afiliado TikTok Shop", d: "Precisa saber qual produto paga bem e já converte hoje, não no mês passado." },
  { t: "Loja e vendedor", d: "Quer achar criadores que faturam no seu nicho e ver o que a concorrência posta." },
  { t: "Agência", d: "Gerencia vários perfis e precisa de volume de conteúdo sem inflar a equipe." },
];

type IvEstado = "nada" | "ativando" | "ativo" | "sem-acesso" | "erro";

function Home() {
  const router = useRouter();
  const { user, loading: checkingSession } = useAuth();
  const [ivEstado, setIvEstado] = useState<IvEstado>("nada");
  const ivGrant = new URLSearchParams(window.location.search).get("iv_grant");

  useEffect(() => {
    if (!ivGrant || checkingSession) return;
    if (!user) {
      void router.navigate({ href: "/entrar?iv=1&redirecionar=%2Fpainel", replace: true });
      return;
    }
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      setIvEstado("ativando");
      try {
        const res = await fetch("/api/indica-vizinho", {
          method: "POST",
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        if (res.ok) {
          const body = (await res.json()) as { ativado?: boolean };
          setIvEstado(body.ativado ? "ativo" : "sem-acesso");
        } else {
          setIvEstado("erro");
        }
      } catch {
        setIvEstado("erro");
      }
    })();
  }, [checkingSession, ivGrant, router, user]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      {ivEstado !== "nada" && (
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-5 py-3 text-[13.5px]">
            {ivEstado === "ativando" && (
              <p className="text-muted-foreground">Ativando seu acesso Indica Vizinho…</p>
            )}
            {ivEstado === "ativo" && (
              <p className="font-medium text-primary">
                Acesso Indica Vizinho ativado! Suas ferramentas estão liberadas no painel.
              </p>
            )}
            {ivEstado === "sem-acesso" && (
              <p className="text-muted-foreground">
                Não encontramos uma compra ou Pacote Vizinho ativo para o seu e-mail na Indica
                Vizinho.
              </p>
            )}
            {ivEstado === "erro" && (
              <p className="text-destructive">
                Não foi possível ativar agora. Tente novamente em alguns minutos.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="aurora relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
          <div>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
              Descubra os produtos que estão{" "}
              <span className="text-gradient">em alta</span> no TikTok Shop
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Pare de adivinhar. Veja o que está em alta e crie roteiros e vídeos com IA pra postar todo dia.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/painel"
                className="glow rounded-full bg-gradient-neon px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                Quero ver o que está vendendo agora
              </Link>
              <Link
                to="/estudio"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold"
              >
                Abrir o Estúdio
              </Link>
            </div>

          </div>

          <div className="glass relative overflow-hidden rounded-3xl p-2">
            <img
              src={painelImageUrl}
              alt="Painel do T@arte com ranking de produtos e métricas do TikTok Shop"
              width={1280}
              height={960}
              className="w-full rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Ferramentas com IA */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl font-bold">
            Um arsenal completo, <span className="text-gradient">com IA integrada</span>
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { to: "/roteirizador", t: "Roteirizador de vídeo com IA", d: "Gancho, corpo, CTA e legenda prontos pra gravar, do seu jeito." },
              { to: "/produtos", t: "Produtos e vídeos", d: "Cada produto com faturamento, comissão e os vídeos que vendem ele." },
              { to: "/cabine", t: "Cabine de troca de roupas", d: "A IA veste a peça na sua foto — grave antes do produto chegar." },
              { to: "/criadores", t: "Criativos para redes sociais", d: "Crie conceito, texto, legenda e imagem para TikTok, Instagram e YouTube." },
              { to: "/cofre", t: "Cofre de Prompts", d: "Prompts prontos e um criador de prompts com IA sob medida." },
              { to: "/indique", t: "Indique e ganhe", d: "Compartilhe seu link e ganhe meses grátis por amigo." },
              { to: "/estudio", t: "Estúdio de roteiros", d: "Crie roteiros de vídeo e live para seu produto ou serviço." },
              { to: "/paginas", t: "Gerador de Páginas", d: "Crie uma página e baixe o arquivo HTML." },
              { to: "/audio", t: "Gerador de Áudio", d: "Transforme seu texto em uma narração para baixar." },
              { to: "/produto", t: "Gerador de Produto", d: "Crie uma proposta de produto com nome, oferta e descrição." },
              { to: "/banner", t: "Gerador de Banner", d: "Crie imagens publicitárias para suas campanhas." },
              { to: "/quiz", t: "Criador de quiz", d: "Crie e baixe um quiz interativo sobre seu tema." },
              { to: "/conversas", t: "Gerador de Conversas", d: "Crie imagens de conversas do WhatsApp identificadas como simulação." },
              { to: "/painel", t: "Painel diário", d: "Ranking recalculado toda madrugada com as vendas do dia." },
            ].map((f) => (
              <Link
                key={f.to}
                to={f.to}
                className="glass block rounded-2xl p-6 transition-colors hover:border-primary/40"
              >
                <h3 className="text-base font-semibold">{f.t}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{f.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vídeos virais */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl font-bold">
            Estes vídeos bombaram — e o produto por trás de cada um está aqui dentro
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {videosVirais.map((v) => (
              <div key={v.id} className="glass rounded-2xl p-5">
                <p className="font-display text-xl font-bold text-primary">{v.views} views</p>
                <p className="mt-1 text-[13px] text-muted-foreground">{v.criador}</p>
                <p className="mt-3 text-sm font-medium">“{v.gancho}”</p>
                <p className="mt-2 text-[13px] text-muted-foreground">Produto: {v.produto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dores + top produtos */}
      <section className="border-b border-border py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">
              A diferença entre quem fatura e quem flopa não é sorte — é{" "}
              <span className="text-gradient">informação</span>
            </h2>
            <ul className="mt-6 space-y-3">
              {dores.map((d) => (
                <li key={d} className="flex gap-3 text-[14.5px] text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[14.5px] text-muted-foreground">
              Uma inteligência que fica 24h rastreando o que vende no TikTok Shop. Enquanto você
              dorme, o T@arte recolhe as métricas do dia e recalcula o ranking.
            </p>
          </div>
          <div className="glass rounded-2xl p-2">
            <div className="px-4 py-3 text-xs tracking-widest text-muted-foreground uppercase">
              Top 6 faturamento · últimas 24h
            </div>
            {produtos.slice(0, 6).map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-t border-border px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-5 font-display text-sm text-muted-foreground">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.nome}</p>
                    <p className="text-xs text-muted-foreground">{p.nicho}</p>
                  </div>
                </div>
                <div className="pl-3 text-right">
                  <p className="text-sm font-semibold text-primary">{brl(p.faturamento)}</p>
                  <p className="text-xs text-muted-foreground">+{p.crescimento}%</p>
                </div>
              </div>
            ))}
            <div className="p-4">
              <Link
                to="/painel"
                className="block rounded-xl border border-border py-2.5 text-center text-sm font-semibold"
              >
                Ver o ranking completo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pra quem é */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl font-bold">Pra quem é o T@arte</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {praQuem.map((p) => (
              <div key={p.t} className="glass rounded-2xl p-6">
                <h3 className="text-base font-semibold">{p.t}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ resumo + CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="font-display text-3xl font-bold">Perguntas frequentes</h2>
          <div className="mt-8 space-y-3">
            {faq.slice(0, 4).map((f) => (
              <details key={f.q} className="glass rounded-xl px-5 py-4">
                <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/planos"
              className="glow inline-block rounded-full bg-gradient-neon px-7 py-3.5 text-sm font-semibold text-primary-foreground"
            >
              Garantir meu acesso
            </Link>
            <p className="mt-3 text-[13px] text-muted-foreground">
              7 dias de garantia · reembolso 100%
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
