import { createServerFn } from "@tanstack/react-start";
import { requireAuthenticatedUser } from "@/lib/authenticated-server.middleware";

const FAL_QUEUE = "https://queue.fal.run";
const MODELO = "fal-ai/ltx-video/image-to-video";
const LIMITE_DIARIO = 3;

type FalInput = { prompt: string; imagem: string; formato: string };

function validarFal(data: unknown): FalInput {
  const d = data as Partial<FalInput>;
  if (!d || typeof d.prompt !== "string" || d.prompt.trim().length < 10) {
    throw new Error("Descreva o vídeo com mais detalhes.");
  }
  if (typeof d.imagem !== "string" || !d.imagem.startsWith("data:image/")) {
    throw new Error("Envie uma imagem para começar o vídeo.");
  }
  if (d.imagem.length > 9_000_000) {
    throw new Error("A imagem está muito grande. Use uma menor.");
  }
  return {
    prompt: d.prompt.slice(0, 2000),
    imagem: d.imagem,
    formato: d.formato === "16:9" ? "16:9" : "9:16",
  };
}

function erroAmigavel(): string {
  return "Não foi possível gerar o vídeo agora. Tente novamente em alguns minutos.";
}

/** Envia imagem + prompt para a fila da fal.ai e registra o uso diário. */
export const criarVideoFal = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedUser])
  .inputValidator(validarFal)
  .handler(async ({ data, context }) => {
    const key = process.env["FAL_KEY"];
    if (!key) throw new Error("A geração de vídeo não está configurada.");

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);
    const { count, error: erroContagem } = await context.supabase
      .from("video_geracoes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .gte("created_at", inicioDoDia.toISOString());
    if (erroContagem) throw new Error(erroAmigavel());
    if ((count ?? 0) >= LIMITE_DIARIO) {
      throw new Error(
        `Você já gerou ${LIMITE_DIARIO} vídeos hoje. O limite volta a liberar amanhã.`,
      );
    }

    const res = await fetch(`${FAL_QUEUE}/${MODELO}`, {
      method: "POST",
      headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: data.prompt,
        image_url: data.imagem,
        duration: "5",
        resolution: "720p",
        aspect_ratio: data.formato,
      }),
    });
    if (!res.ok) throw new Error(erroAmigavel());
    const fila = (await res.json()) as {
      request_id?: string;
      status_url?: string;
      response_url?: string;
    };
    if (!fila.request_id || !fila.status_url || !fila.response_url) {
      throw new Error(erroAmigavel());
    }

    const { error: erroRegistro } = await context.supabase
      .from("video_geracoes")
      .insert({ user_id: context.userId });
    if (erroRegistro) throw new Error(erroAmigavel());

    const restantes = LIMITE_DIARIO - (count ?? 0) - 1;
    return {
      pedido: fila.request_id,
      statusUrl: fila.status_url,
      respostaUrl: fila.response_url,
      restantes,
    };
  });

/** Consulta o pedido na fila; quando pronto, devolve o endereço do vídeo. */
export const consultarVideoFal = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedUser])
  .inputValidator((data: unknown) => {
    const d = data as { statusUrl?: string; respostaUrl?: string };
    if (
      !d ||
      typeof d.statusUrl !== "string" ||
      !d.statusUrl.startsWith(`${FAL_QUEUE}/`) ||
      typeof d.respostaUrl !== "string" ||
      !d.respostaUrl.startsWith(`${FAL_QUEUE}/`)
    ) {
      throw new Error("Pedido de vídeo inválido.");
    }
    return { statusUrl: d.statusUrl, respostaUrl: d.respostaUrl };
  })
  .handler(async ({ data }) => {
    const key = process.env["FAL_KEY"];
    if (!key) throw new Error("A geração de vídeo não está configurada.");

    const res = await fetch(data.statusUrl, {
      headers: { Authorization: `Key ${key}` },
    });
    if (!res.ok) throw new Error(erroAmigavel());
    const status = (await res.json()) as { status?: string };

    if (status.status !== "COMPLETED") {
      return { pronto: false as const, video: null };
    }

    const resposta = await fetch(data.respostaUrl, {
      headers: { Authorization: `Key ${key}` },
    });
    if (!resposta.ok) throw new Error(erroAmigavel());
    const json = (await resposta.json()) as { video?: { url?: string } };
    const url = json.video?.url;
    if (!url) throw new Error(erroAmigavel());
    return { pronto: true as const, video: url };
  });
