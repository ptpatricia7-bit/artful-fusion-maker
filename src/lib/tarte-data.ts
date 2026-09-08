export type Produto = {
  id: string;
  nome: string;
  nicho: string;
  faturamento: number;
  vendas: number;
  crescimento: number;
  preco: number;
  comissao: number;
  criadores: number;
  tendencia: "explodindo" | "subindo" | "estavel";
};

export const produtos: Produto[] = [
  { id: "p1", nome: "Sérum Facial Vitamina C 30ml", nicho: "Beleza", faturamento: 1284000, vendas: 42800, crescimento: 312, preco: 39.9, comissao: 22, criadores: 184, tendencia: "explodindo" },
  { id: "p2", nome: "Mini Massageador Muscular", nicho: "Saúde", faturamento: 986500, vendas: 21300, crescimento: 178, preco: 89.9, comissao: 18, criadores: 96, tendencia: "explodindo" },
  { id: "p3", nome: "Batom Líquido Longa Duração", nicho: "Beleza", faturamento: 742300, vendas: 61200, crescimento: 84, preco: 19.9, comissao: 25, criadores: 240, tendencia: "subindo" },
  { id: "p4", nome: "Organizador de Geladeira 6 Peças", nicho: "Casa", faturamento: 615700, vendas: 18400, crescimento: 143, preco: 54.9, comissao: 15, criadores: 71, tendencia: "subindo" },
  { id: "p5", nome: "Fone Bluetooth Esportivo", nicho: "Eletrônicos", faturamento: 588200, vendas: 9700, crescimento: 41, preco: 119.9, comissao: 12, criadores: 63, tendencia: "estavel" },
  { id: "p6", nome: "Escova Secadora 3 em 1", nicho: "Beleza", faturamento: 512900, vendas: 7100, crescimento: 96, preco: 149.9, comissao: 17, criadores: 58, tendencia: "subindo" },
  { id: "p7", nome: "Creatina Monohidratada 300g", nicho: "Suplementos", faturamento: 498100, vendas: 8300, crescimento: 205, preco: 79.9, comissao: 20, criadores: 112, tendencia: "explodindo" },
  { id: "p8", nome: "Perfume Importado Inspirado 55ml", nicho: "Perfumaria", faturamento: 451800, vendas: 12600, crescimento: 67, preco: 44.9, comissao: 24, criadores: 149, tendencia: "subindo" },
  { id: "p9", nome: "Luminária de Mesa Recarregável", nicho: "Casa", faturamento: 387400, vendas: 6800, crescimento: 22, preco: 69.9, comissao: 14, criadores: 34, tendencia: "estavel" },
  { id: "p10", nome: "Kit Cílios Magnéticos", nicho: "Beleza", faturamento: 364200, vendas: 15200, crescimento: 121, preco: 29.9, comissao: 26, criadores: 128, tendencia: "subindo" },
  { id: "p11", nome: "Air Fryer Compacta 3L", nicho: "Casa", faturamento: 341000, vendas: 2900, crescimento: 58, preco: 249.9, comissao: 10, criadores: 27, tendencia: "estavel" },
  { id: "p12", nome: "Gel Fixador de Sobrancelha", nicho: "Beleza", faturamento: 298600, vendas: 24100, crescimento: 264, preco: 14.9, comissao: 28, criadores: 203, tendencia: "explodindo" },
];

export const nichos = ["Todos", "Beleza", "Casa", "Saúde", "Eletrônicos", "Suplementos", "Perfumaria"];
export const periodos = ["24 horas", "7 dias", "30 dias", "90 dias"];

export type VideoViral = {
  id: string;
  criador: string;
  views: string;
  produto: string;
  gancho: string;
  engajamento: string;
};

export const videosVirais: VideoViral[] = [
  { id: "v1", criador: "@chiara.sbardellati", views: "69.8M", produto: "Sérum Facial Vitamina C", gancho: "Ninguém acredita que isso custa R$ 39", engajamento: "12.4%" },
  { id: "v2", criador: "@davidlin49597c7x", views: "40.5M", produto: "Mini Massageador Muscular", gancho: "Testei por 7 dias e olha o resultado", engajamento: "9.8%" },
  { id: "v3", criador: "@denineumann", views: "40.4M", produto: "Batom Líquido Longa Duração", gancho: "Passei e fui almoçar sem retocar", engajamento: "11.1%" },
  { id: "v4", criador: "@fer98sp", views: "38.2M", produto: "Organizador de Geladeira", gancho: "Minha geladeira mudou em 3 minutos", engajamento: "8.6%" },
  { id: "v5", criador: "@brandonlow", views: "37.8M", produto: "Creatina Monohidratada", gancho: "O erro que todo mundo comete tomando isso", engajamento: "10.2%" },
  { id: "v6", criador: "@tanicha_rose", views: "37.6M", produto: "Escova Secadora 3 em 1", gancho: "Salão em casa em 6 minutos", engajamento: "13.5%" },
  { id: "v7", criador: "@camhuetlifts", views: "34.1M", produto: "Fone Bluetooth Esportivo", gancho: "Não cai nem correndo 10km", engajamento: "7.4%" },
  { id: "v8", criador: "@thinhairgirl", views: "32.8M", produto: "Kit Cílios Magnéticos", gancho: "Sem cola, sem drama, 20 segundos", engajamento: "14.2%" },
  { id: "v9", criador: "@cjandsam1", views: "31.1M", produto: "Gel Fixador de Sobrancelha", gancho: "R$ 14 que mudou meu rosto", engajamento: "15.0%" },
];

export type Criador = {
  nome: string;
  seguidores: string;
  faturamento: number;
  nicho: string;
  videos: number;
};

export const criadores: Criador[] = [
  { nome: "@lauramakeup", seguidores: "1.2M", faturamento: 412000, nicho: "Beleza", videos: 184 },
  { nome: "@casadaju", seguidores: "870K", faturamento: 318500, nicho: "Casa", videos: 142 },
  { nome: "@treinodoraul", seguidores: "640K", faturamento: 286300, nicho: "Suplementos", videos: 121 },
  { nome: "@achadosdapaty", seguidores: "1.9M", faturamento: 264900, nicho: "Variedades", videos: 260 },
  { nome: "@perfumesdobru", seguidores: "410K", faturamento: 198700, nicho: "Perfumaria", videos: 98 },
  { nome: "@tech.dolucas", seguidores: "530K", faturamento: 154200, nicho: "Eletrônicos", videos: 76 },
];

export const planos = [
  {
    nome: "Mensal",
    preco: "R$ 97",
    ciclo: "/mês",
    destaque: false,
    resumo: "Pra testar o método com tudo liberado.",
    itens: [
      "Ranking de TOP produtos do TikTok Shop BR",
      "Multiplicador de Vídeos até 150 combinações",
      "Vídeos virais com o produto por trás de cada um",
      "Tendências 24h antes de saturar",
      "Atualização diária dos dados",
    ],
  },
  {
    nome: "Trimestral",
    preco: "R$ 237",
    ciclo: "/3 meses",
    destaque: true,
    resumo: "O plano de quem vai postar todo dia.",
    itens: [
      "Tudo do plano Mensal",
      "Roteirizar Vídeos com IA — gancho, corpo e CTA",
      "Roteirizar Live com IA + teleprompter + PDF",
      "Criadores e lojas que mais faturam no Brasil",
      "Dados dos EUA pra antecipar a próxima onda",
      "Acesso completo, sem limite de buscas",
    ],
  },
  {
    nome: "Anual",
    preco: "R$ 697",
    ciclo: "/ano",
    destaque: false,
    resumo: "Melhor custo por mês, tudo liberado.",
    itens: [
      "Tudo do plano Trimestral",
      "Filtros por nicho, categoria, faturamento e período",
      "Ranking por período real (não acumulado)",
      "Exportação de listas em CSV",
      "Prioridade em novos recursos",
    ],
  },
];

export const faq = [
  {
    q: "O que exatamente é o T@arte?",
    a: "É um painel com métricas reais do TikTok Shop Brasil somado a um estúdio que multiplica os seus vídeos. Você vê o que está vendendo agora e transforma 18 gravações curtas em até 150 vídeos prontos pra postar.",
  },
  {
    q: "O TikTok pode me punir por postar vídeos parecidos?",
    a: "Cada vídeo montado sai com a etiqueta de originalidade, indicando o quanto ele se diferencia dos outros. Você posta primeiro os marcados como Original e deixa os mais parecidos por último — a ordem certa vem pronta.",
  },
  {
    q: "Preciso saber editar vídeo?",
    a: "Não. Você grava 10 ganchos, 5 corpos e 3 CTAs no celular, arrasta pras três caixas do Estúdio e recebe as combinações montadas.",
  },
  {
    q: "Com que frequência os dados são atualizados?",
    a: "Todos os dias. Durante a madrugada as métricas de vendas do dia anterior são recolhidas e o ranking é recalculado.",
  },
  {
    q: "Serve pra quem ainda não vende nada?",
    a: "Sim. Quem está começando ganha mais: escolhe produto com base em faturamento real em vez de achismo e já sai com os ganchos que estão funcionando.",
  },
  {
    q: "Tem garantia?",
    a: "7 dias de garantia com reembolso de 100% do valor, sem perguntas.",
  },
];

export const brl = (v: number) =>
  v >= 1000000
    ? `R$ ${(v / 1000000).toFixed(1).replace(".", ",")}M`
    : v >= 1000
      ? `R$ ${Math.round(v / 1000)}K`
      : `R$ ${v.toFixed(2).replace(".", ",")}`;
