import { createFileRoute, Link } from "@tanstack/react-router";
import heroPainel from "@/assets/hero-painel.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { videosVirais, produtos, brl, faq } from "@/lib/tarte-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "T@arte — Veja o que está vendendo milhões no TikTok Shop Brasil" },
      {
        name: "description",
        content:
          "Descubra os produtos e vídeos que faturam milhões no TikTok Shop BR e transforme 18 gravações em até 150 vídeos prontos pra postar.",
      },
      { property: "og:title", content: "T@arte — o que está vendendo agora no TikTok Shop BR" },
      {
        property: "og:description",
        content:
          "Métricas reais do TikTok Shop Brasil + Multiplicador de Vídeos: grave 18 pedaços, receba 150 vídeos prontos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const passos = [
  {
    n: "01",
    t: "Grave 18 pedaços",
    d: "Uns 20 minutos com o celular: 10 ganchos, 5 corpos e 3 CTAs. A gente já te dá as ideias.",
  },
  {
    n: "02",
    t: "Suba tudo no Estúdio",
    d: "Arrasta e solta nas 3 caixas: Gancho, Corpo e CTA. Sem edição, sem programa complicado.",
  },
  {
    n: "03",
    t: "A gente monta pra você",
    d: "Os 150 vídeos saem prontos, já encaixados e com a etiqueta de originalidade.",
  },
  {
    n: "04",
    t: "Baixe e poste sem parar",
    d: "Tudo salvo na sua galeria. Posta 1 por dia e descobre qual gancho vira viral.",
  },
];

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

const etiquetas = [
  { rotulo: "Original", cor: "text-primary", nota: "poste primeiro" },
  { rotulo: "Repete um pouco", cor: "text-gold", nota: "diferencie a headline" },
  { rotulo: "Bem parecido", cor: "text-accent", nota: "deixe por último" },
];

function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="aurora relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
          <div>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              111+ criadores no radar
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
              Descubra os produtos que estão{" "}
              <span className="text-gradient">faturando milhões</span> no TikTok Shop
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Pare de adivinhar. Veja o que está vendendo agora e use o Multiplicador de Vídeos:
              você grava 18 pedaços e o T@arte monta até 150 vídeos únicos pra postar todo dia.
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
            <div className="mt-10 flex flex-wrap gap-8">
              <div>
                <p className="text-xs tracking-widest text-muted-foreground uppercase">
                  Faturando agora
                </p>
                <p className="font-display text-2xl font-bold text-primary">R$ 292K</p>
              </div>
              <div>
                <p className="text-xs tracking-widest text-muted-foreground uppercase">
                  Vendas hoje
                </p>
                <p className="font-display text-2xl font-bold">606K</p>
              </div>
              <div>
                <p className="text-xs tracking-widest text-muted-foreground uppercase">
                  Catálogo mapeado
                </p>
                <p className="font-display text-2xl font-bold">R$ 1,7 bi</p>
              </div>
            </div>
          </div>

          <div className="glass relative overflow-hidden rounded-3xl p-2">
            <img
              src={heroPainel}
              alt="Painel do T@arte com ranking de produtos e métricas do TikTok Shop"
              width={1280}
              height={960}
              className="w-full rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Multiplicador */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-xs tracking-widest text-primary uppercase">
            O recurso que fez o T@arte estourar
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Multiplicador de Vídeos Virais
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Você grava 10 ganchos, 5 corpos e 3 CTAs — 18 pedacinhos, uns 20 minutos de celular. O
            T@arte junta tudo e te devolve 150 vídeos diferentes, prontos pra subir no TikTok. É
            conteúdo pra meses gravando uma vez só.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { t: "Gancho", n: 10 },
              { t: "Corpo", n: 5 },
              { t: "CTA", n: 3 },
            ].map((b) => (
              <div key={b.t} className="glass rounded-2xl p-6">
                <p className="text-sm text-muted-foreground">{b.t}</p>
                <p className="mt-1 font-display text-4xl font-bold text-gradient">{b.n}</p>
                <p className="mt-1 text-xs text-muted-foreground">{b.n} opções gravadas</p>
              </div>
            ))}
          </div>

          <div className="glow mt-4 rounded-2xl bg-gradient-neon p-6 text-center text-primary-foreground">
            <p className="font-display text-2xl font-bold">10 × 5 × 3 = 150 vídeos prontos</p>
            <p className="mt-1 text-sm opacity-80">
              Cada um já montado e pronto pra subir — você não edita nada.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {passos.map((p) => (
              <div key={p.n} className="glass rounded-2xl p-6">
                <span className="font-display text-sm font-bold text-primary">{p.n}</span>
                <h3 className="mt-3 text-base font-semibold">{p.t}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{p.d}</p>
              </div>
            ))}
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
              { to: "/spy", t: "GeraSpy ADS", d: "Espie os anúncios que mais vendem e a IA cria variações melhores." },
              { to: "/criadores", t: "Criadores e lojas", d: "Quem mais fatura no TikTok Shop BR, por nicho." },
              { to: "/cofre", t: "Cofre de Prompts", d: "Prompts prontos e um criador de prompts com IA sob medida." },
              { to: "/indique", t: "Indique e ganhe", d: "Compartilhe seu link e ganhe meses grátis por amigo." },
              { to: "/estudio", t: "Multiplicador de Vídeos", d: "18 gravações viram até 150 vídeos com etiqueta de originalidade." },
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

      {/* Etiqueta de originalidade */}
      <section className="border-b border-border py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs tracking-widest text-primary uppercase">
              Etiqueta de originalidade
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold">
              “Mas o TikTok não vai me punir por postar vídeo parecido?”
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              É pra isso que existe a etiqueta. Cada um dos 150 vídeos sai marcado com o quanto ele
              se diferencia dos outros — e a ferramenta te entrega a ordem certa de postar. Os
              marcados como Original você posta primeiro, à vontade.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {etiquetas.map((e) => (
              <div
                key={e.rotulo}
                className="glass flex items-center justify-between rounded-xl px-5 py-4"
              >
                <span className={`font-semibold ${e.cor}`}>{e.rotulo}</span>
                <span className="text-[13px] text-muted-foreground">{e.nota}</span>
              </div>
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
