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
