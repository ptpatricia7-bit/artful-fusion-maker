import { createServerFn } from "@tanstack/react-start";
import { requireAuthenticatedUser } from "@/lib/authenticated-server.middleware";

const FAL_QUEUE = "https://queue.fal.run";
const MODELO = "fal-ai/ltx-video/image-to-video";

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

export const consultarUsoVideoFal = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedUser])
  .handler(async ({ context }) => {
    const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
    const { data, error } = await context.supabase
      .from("fal_video_daily_usage")
      .select("used")
      .eq("user_id", context.userId)
      .eq("usage_date", dia)
      .maybeSingle();
    if (error) return { usados: null, erro: "Não foi possível consultar seu limite. Tente novamente." };
    return { usados: data?.used ?? 0, erro: null };
  });

/** Envia imagem + prompt para a fila da fal.ai e devolve os dados do pedido. */
export const criarVideoFal = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedUser])
  .inputValidator(validarFal)
  .handler(async ({ data, context }) => {
    const key = process.env["FAL_KEY"];
    if (!key) return { erro: "A geração de vídeo não está configurada.", usados: null, pedido: null };

    // Only this authenticated handler can reserve quota. The database upsert
    // locks the account/day row, including across simultaneous requests.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: usados, error } = await supabaseAdmin.rpc("reserve_fal_video_quota", {
      p_user_id: context.userId,
    });
    if (error) return { erro: "Não foi possível validar seu limite. Tente novamente.", usados: null, pedido: null };
    if (usados === null) return { erro: "Você já iniciou 3 vídeos hoje. O limite será liberado amanhã, no horário de Brasília.", usados: 3, pedido: null };

    try {
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
    return {
      erro: null,
      usados,
      pedido: { id: fila.request_id, statusUrl: fila.status_url, respostaUrl: fila.response_url },
    };
    } catch {
      // Keep reservations after uncertain provider failures: retrying must not
      // allow a fourth billable request when the first request was accepted.
      return { erro: erroAmigavel(), usados, pedido: null };
    }
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
