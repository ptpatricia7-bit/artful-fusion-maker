import { createServerFn } from "@tanstack/react-start";

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
  return corpo?.message ?? "A inteligência artificial não respondeu agora. Tente novamente.";
}

/** Gera texto (roteiros, análises, prompts) com a IA integrada. */
export const gerarTexto = createServerFn({ method: "POST" })
  .inputValidator(validarTexto)
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("A inteligência artificial não está configurada.");

    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          {
            role: "system",
            content:
              (data.sistema ||
                "Você é especialista em TikTok Shop Brasil, vídeos curtos que vendem e copy de conversão.") +
              " Responda sempre em português do Brasil, direto ao ponto, em texto simples com títulos curtos. Não use markdown com asteriscos.",
          },
          { role: "user", content: data.pedido },
        ],
      }),
    });

    if (!res.ok) throw new Error(await erroAmigavel(res));

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const texto = json.choices?.[0]?.message?.content?.trim();
    if (!texto) throw new Error("A inteligência artificial devolveu uma resposta vazia.");
    return { texto };
  });

type ProvaInput = { pessoa: string; roupa?: string | undefined; instrucao: string };

function validarProva(data: unknown): ProvaInput {
  const d = data as Partial<ProvaInput>;
  if (!d || typeof d.pessoa !== "string" || !d.pessoa.startsWith("data:image/")) {
    throw new Error("Envie uma foto sua de corpo inteiro.");
  }
  if (d.pessoa.length > 9_000_000) throw new Error("A foto está muito grande. Use uma menor.");
  return {
    pessoa: d.pessoa,
    roupa:
      typeof d.roupa === "string" && d.roupa.startsWith("data:image/") ? d.roupa : undefined,
    instrucao: typeof d.instrucao === "string" ? d.instrucao.slice(0, 1200) : "",
  };
}

/** Cabine de troca de roupas: veste a peça na foto enviada. */
export const provarRoupa = createServerFn({ method: "POST" })
  .inputValidator(validarProva)
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("A inteligência artificial não está configurada.");

    const imagens = data.roupa ? [data.pessoa, data.roupa] : [data.pessoa];
    const prompt = data.roupa
      ? `Prova virtual de roupa. Na primeira imagem está a pessoa; na segunda, a peça de roupa. Vista a pessoa com essa peça mantendo o rosto, o corpo, a pele, o cabelo e o fundo exatamente iguais. Caimento realista, sombras e dobras naturais, foto de moda pronta para vídeo de TikTok Shop. ${data.instrucao}`
      : `Prova virtual de roupa na pessoa da imagem. Troque a roupa dela por: ${data.instrucao}. Mantenha rosto, corpo, pele, cabelo e fundo exatamente iguais, com caimento realista e sombras naturais.`;

    const res = await fetch(`${GATEWAY}/images/generations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image",
        prompt,
        image: imagens.length === 1 ? imagens[0] : imagens,
      }),
    });

    if (!res.ok) throw new Error(await erroAmigavel(res));

    const json = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("Não foi possível gerar a prova da roupa. Tente outra foto.");
    return { imagem: `data:image/png;base64,${b64}` };
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
