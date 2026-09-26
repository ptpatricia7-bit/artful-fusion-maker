import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

type TextoInput = { sistema: string; pedido: string };

function validarTexto(data: unknown): TextoInput {
  const d = data as Partial<TextoInput>;
  if (!d || typeof d.pedido !== "string" || d.pedido.trim().length < 3) {
    throw new Error("Descreva melhor o que você quer gerar.");
  }
  return {
    sistema: typeof d.sistema === "string" ? d.sistema.slice(0, 4000) : "",
    pedido: d.pedido.slice(0, 6000),
  };
}

async function erroAmigavel(res: Response) {
  const corpo = (await res.json().catch(() => null)) as { message?: string } | null;
  if (res.status === 402) {
    return "Os créditos de inteligência artificial acabaram. Adicione créditos para continuar.";
  }
  if (res.status === 429) {
    return "Muitos pedidos ao mesmo tempo. Espere alguns segundos e tente de novo.";
  }
  if (res.status === 403) {
    return corpo?.message ?? "A inteligência artificial está bloqueada nas configurações do espaço de trabalho.";
  }
  return corpo?.message ?? "A inteligência artificial não respondeu agora. Tente novamente.";
}

async function lerRespostaEmFluxo(res: Response) {
  if (!res.body) return "";
  const leitor = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let restante = "";
  let texto = "";
  while (true) {
    const { value, done } = await leitor.read();
    if (done) break;
    restante += value;
    const linhas = restante.split("\n");
    restante = linhas.pop() ?? "";
    for (const linha of linhas) {
      if (!linha.startsWith("data: ") || linha === "data: [DONE]") continue;
      try {
        const evento = JSON.parse(linha.slice(6)) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (evento.type === "response.output_text.delta" && evento.delta) texto += evento.delta;
        if (!texto && evento.type === "response.completed" && evento.response?.output_text) {
          texto = evento.response.output_text;
        }
      } catch {
        // Eventos incompletos ou sem texto podem ser ignorados.
      }
    }
  }
  return texto.trim();
}

/** Gera texto (roteiros, análises, prompts) com a IA integrada. */
export const gerarTexto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validarTexto)
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("A inteligência artificial não está configurada.");

    const res = await fetch(`${GATEWAY}/responses`, {
      method: "POST",
      headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: [
          { role: "developer", content: (data.sistema || "Você é especialista em conteúdo que vende nas redes sociais.") + " Responda em português do Brasil, direto ao ponto, com títulos curtos e sem asteriscos." },
          { role: "user", content: data.pedido },
        ],
        stream: true,
        reasoning: { effort: "medium", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        store: false,
      }),
    });

    if (!res.ok) throw new Error(await erroAmigavel(res));

    const texto = await lerRespostaEmFluxo(res);
    if (!texto) throw new Error("A inteligência artificial devolveu uma resposta vazia.");
    return { texto };
  });

const MODOS_ESTUDIO = [
  "roupa",
  "profissional",
  "tres-d",
  "personagem",
  "produto",
  "restauracao",
] as const;

type ModoEstudio = (typeof MODOS_ESTUDIO)[number];
type EstudioInput = {
  modo: ModoEstudio;
  imagem: string;
  referencia?: string | undefined;
  instrucao: string;
};

function validarImagemEstudio(data: unknown): EstudioInput {
  const d = data as Partial<EstudioInput>;
  if (!d || typeof d.imagem !== "string" || !d.imagem.startsWith("data:image/")) {
    throw new Error("Envie a imagem principal para começar.");
  }
  if (d.imagem.length > 9_000_000) throw new Error("A imagem está muito grande. Use uma menor.");
  const modo = MODOS_ESTUDIO.includes(d.modo as ModoEstudio) ? (d.modo as ModoEstudio) : "roupa";
  const referencia =
    typeof d.referencia === "string" && d.referencia.startsWith("data:image/")
      ? d.referencia
      : undefined;
  if (referencia && referencia.length > 9_000_000) {
    throw new Error("A imagem de referência está muito grande. Use uma menor.");
  }
  return {
    modo,
    imagem: d.imagem,
    referencia,
    instrucao: typeof d.instrucao === "string" ? d.instrucao.slice(0, 1200) : "",
  };
}

function criarPromptEstudio(data: EstudioInput) {
  const complemento = data.instrucao.trim()
    ? `Ajuste solicitado pela pessoa: ${data.instrucao.trim()}.`
    : "";
  const prompts: Record<ModoEstudio, string> = {
    roupa: data.referencia
      ? "Faça uma prova virtual. A primeira imagem mostra a pessoa e a segunda mostra a roupa. Vista a pessoa com a peça da referência, preservando exatamente rosto, corpo, pele, cabelo, pose e cenário. Reproduza tecido, cor e detalhes da peça com caimento, dobras e sombras realistas."
      : "Faça uma prova virtual na pessoa da imagem, trocando apenas a roupa conforme a descrição. Preserve exatamente rosto, corpo, pele, cabelo, pose e cenário. Crie caimento, dobras e sombras realistas.",
    profissional:
      "Transforme a imagem principal em um ensaio fotográfico profissional de alta qualidade. Preserve exatamente a identidade, os traços do rosto e a aparência real da pessoa ou objeto. Melhore enquadramento, iluminação de estúdio, nitidez, equilíbrio de cor e acabamento editorial, sem parecer artificial.",
    "tres-d":
      "Transforme a imagem principal em uma arte 3D premium, rica em volume, profundidade, materiais, reflexos e iluminação cinematográfica. Preserve a identidade visual, cores e elementos reconhecíveis do original. O resultado deve parecer uma renderização 3D profissional e detalhada.",
    personagem: data.referencia
      ? "Transforme a pessoa ou objeto da primeira imagem no personagem mostrado na segunda imagem. Preserve o rosto, a identidade, a pose e a composição principal da primeira imagem, aplicando com fidelidade o figurino, cabelo, acessórios e estilo visual da referência."
      : "Transforme a pessoa da imagem no personagem descrito. Preserve o rosto, a identidade, a pose e a composição principal, mudando figurino, cabelo, acessórios e atmosfera para representar o personagem com qualidade profissional.",
    produto: data.referencia
      ? "Crie uma fotografia publicitária profissional do produto da primeira imagem, usando a segunda imagem como referência de cenário ou estilo. Preserve rigorosamente o formato, a marca, o rótulo, as cores e os detalhes reais do produto. Use iluminação comercial e composição pronta para redes sociais."
      : "Crie uma fotografia publicitária profissional do produto da imagem. Remova distrações e valorize o produto com iluminação comercial, cenário elegante e composição pronta para redes sociais. Preserve rigorosamente formato, marca, rótulo, cores e detalhes reais.",
    restauracao:
      "Restaure cuidadosamente a imagem antiga ou danificada. Remova riscos, manchas, ruído, desbotamento, rasgos e áreas deterioradas; recupere nitidez, contraste e detalhes naturais. Preserve rostos, identidade, roupas, objetos e composição histórica. Não invente elementos nem altere as pessoas.",
  };
  return `${prompts[data.modo]} ${complemento}`.trim();
}

/** Estúdio visual: transforma uma ou duas imagens conforme a ferramenta escolhida. */
export const gerarImagemEstudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validarImagemEstudio)
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("A inteligência artificial não está configurada.");

    const conteudo: unknown[] = [
      { type: "text", text: criarPromptEstudio(data) },
      { type: "image_url", image_url: { url: data.imagem } },
    ];
    if (data.referencia) {
      conteudo.push({ type: "image_url", image_url: { url: data.referencia } });
    }

    const res = await fetch(`${GATEWAY}/images/generations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image",
        messages: [{ role: "user", content: conteudo }],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) throw new Error(await erroAmigavel(res));

    const json = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("Não foi possível criar a imagem. Tente outra foto ou descrição.");
    return { imagem: `data:image/png;base64,${b64}` };
  });

type CriativoInput = { produto: string; rede: string; formato: string; conceito: string };

export const gerarImagemCriativo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const d = data as Partial<CriativoInput>;
    if (!d || typeof d.produto !== "string" || d.produto.trim().length < 2) {
      throw new Error("Digite o produto ou serviço do criativo.");
    }
    return {
      produto: d.produto.slice(0, 300),
      rede: typeof d.rede === "string" ? d.rede.slice(0, 50) : "Instagram",
      formato: typeof d.formato === "string" ? d.formato.slice(0, 80) : "Feed vertical",
      conceito: typeof d.conceito === "string" ? d.conceito.slice(0, 1000) : "",
    };
  })
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("A inteligência artificial não está configurada.");
    const res = await fetch(`${GATEWAY}/images/generations`, {
      method: "POST",
      headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-image-2.5-sunburst",
        prompt: `Crie uma imagem publicitária profissional para ${data.rede}, formato ${data.formato}, divulgando ${data.produto}. ${data.conceito}. Sem logotipos inventados e sem textos ilegíveis. Composição pronta para redes sociais.`,
      }),
    });
    if (!res.ok) throw new Error(await erroAmigavel(res));
    const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
    const item = json.data?.[0];
    const imagem = item?.b64_json ? `data:image/png;base64,${item.b64_json}` : item?.url;
    if (!imagem) throw new Error("Não foi possível criar a imagem do criativo.");
    return { imagem };
  });

type PesquisaInput = { termo: string; plataforma: string };

export const pesquisarMercado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const d = data as Partial<PesquisaInput>;
    if (!d || typeof d.termo !== "string" || d.termo.trim().length < 2) {
      throw new Error("Digite um produto, serviço ou nicho para pesquisar.");
    }
    const plataforma = ["TikTok", "Instagram", "YouTube", "Todas"].includes(String(d.plataforma))
      ? String(d.plataforma)
      : "Todas";
    return { termo: d.termo.slice(0, 300), plataforma };
  })
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("A inteligência artificial não está configurada.");
    const res = await fetch(`${GATEWAY}/responses`, {
      method: "POST",
      headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: [
          {
            role: "developer",
            content:
              "Pesquise dados públicos recentes de social commerce. Responda em português do Brasil. Diferencie fatos, sinais públicos e estimativas. Nunca invente faturamento. Inclua ao final as URLs das fontes consultadas.",
          },
          {
            role: "user",
            content: `Pesquise ${data.termo} em ${data.plataforma === "Todas" ? "TikTok, Instagram e YouTube" : data.plataforma}. Mostre: produtos ou ofertas em alta, sinais de vendas/faturamento disponíveis publicamente, criadores ou canais que mais se destacam, formatos de conteúdo vencedores e oportunidades práticas. Seja objetivo.`,
          },
        ],
        tools: [{ type: "web_search" }],
        stream: true,
        reasoning: { effort: "medium", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        store: false,
      }),
    });
    if (!res.ok) throw new Error(await erroAmigavel(res));
    const texto = await lerRespostaEmFluxo(res);
    if (!texto) throw new Error("A pesquisa não encontrou informações suficientes.");
    return { texto };
  });

type VideoInput = { pedido: string; duracao: string; formato: string; imagem?: string | undefined };

function validarVideo(data: unknown): VideoInput {
  const d = data as Partial<VideoInput>;
  if (!d || typeof d.pedido !== "string" || d.pedido.trim().length < 10) {
    throw new Error("Descreva a cena do vídeo com mais detalhes.");
  }
  const duracao = ["5s", "6s", "8s", "10s"].includes(String(d.duracao)) ? String(d.duracao) : "8s";
  const formato = d.formato === "16:9" ? "16:9" : "9:16";
  const imagem =
    typeof d.imagem === "string" && d.imagem.startsWith("data:image/") ? d.imagem : undefined;
  if (imagem && imagem.length > 9_000_000) throw new Error("A foto está muito grande. Use uma menor.");
  return { pedido: d.pedido.slice(0, 3000), duracao, formato, imagem };
}

/** Cria o pedido de vídeo com IA e devolve o número do pedido. */
export const criarVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validarVideo)
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("A inteligência artificial não está configurada.");

    const partes: unknown[] = [{ type: "text", text: data.pedido }];
    if (data.imagem) {
      const [cabecalho, base64] = data.imagem.split(",");
      partes.push({
        type: "image",
        data: base64,
        mime_type: cabecalho?.slice(5).split(";")[0] ?? "image/png",
      });
    }

    const res = await fetch(`${GATEWAY}/videos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-omni-1.1-flash",
        input: partes,
        response_format: data.imagem
          ? { type: "video", resolution: "720p", duration: data.duracao }
          : { type: "video", resolution: "720p", duration: data.duracao, aspect_ratio: data.formato },
      }),
    });

    if (!res.ok) throw new Error(await erroAmigavel(res));
    const json = (await res.json()) as { id?: string };
    if (!json.id) throw new Error("Não foi possível iniciar a criação do vídeo.");
    return { id: json.id };
  });

/** Consulta o pedido de vídeo; quando pronto, devolve o vídeo. */
export const consultarVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const d = data as { id?: string };
    if (!d || typeof d.id !== "string" || !d.id) throw new Error("Pedido de vídeo inválido.");
    return { id: d.id };
  })
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("A inteligência artificial não está configurada.");

    const res = await fetch(`${GATEWAY}/videos/${data.id}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(await erroAmigavel(res));
    const job = (await res.json()) as {
      status?: string;
      progress?: number;
      error?: { message?: string };
    };

    if (job.status === "failed") {
      throw new Error(job.error?.message ?? "A criação do vídeo falhou. Tente outra descrição.");
    }
    if (job.status !== "completed") {
      return { pronto: false as const, progresso: job.progress ?? 0, video: null };
    }

    const arquivo = await fetch(`${GATEWAY}/videos/${data.id}/content`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!arquivo.ok) throw new Error("O vídeo ficou pronto, mas não pôde ser baixado.");
    const bytes = new Uint8Array(await arquivo.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytes.length; i += 8192) {
      bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    return { pronto: true as const, progresso: 100, video: `data:video/mp4;base64,${btoa(bin)}` };
  });
