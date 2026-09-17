export type ClipeLocal = {
  id: string;
  nome: string;
  url: string;
  arquivo: File;
};

function esperar(video: HTMLVideoElement, evento: "loadedmetadata" | "ended") {
  return new Promise<void>((resolve, reject) => {
    const concluir = () => {
      limpar();
      resolve();
    };
    const falhar = () => {
      limpar();
      reject(new Error("Não foi possível ler um dos vídeos selecionados."));
    };
    const limpar = () => {
      video.removeEventListener(evento, concluir);
      video.removeEventListener("error", falhar);
    };
    video.addEventListener(evento, concluir, { once: true });
    video.addEventListener("error", falhar, { once: true });
  });
}

export async function montarVideo(clipes: ClipeLocal[], onProgress?: (value: number) => void) {
  if (clipes.length === 0) throw new Error("Escolha os vídeos antes de montar.");
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 1280;
  const contexto = canvas.getContext("2d");
  if (!contexto) throw new Error("Este navegador não consegue montar o vídeo.");

  const audio = new AudioContext();
  const destino = audio.createMediaStreamDestination();
  const stream = canvas.captureStream(30);
  destino.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
  const mimeTypes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  const mimeType = mimeTypes.find((tipo) => MediaRecorder.isTypeSupported(tipo));
  const gravador = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const partes: Blob[] = [];
  gravador.ondataavailable = (event) => {
    if (event.data.size > 0) partes.push(event.data);
  };
  const finalizado = new Promise<Blob>((resolve) => {
    gravador.onstop = () => resolve(new Blob(partes, { type: gravador.mimeType || "video/webm" }));
  });
  gravador.start(500);

  try {
    for (let indice = 0; indice < clipes.length; indice++) {
      const clipe = clipes[indice];
      if (!clipe) continue;
      const video = document.createElement("video");
      video.src = clipe.url;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      video.muted = false;
      await esperar(video, "loadedmetadata");
      const fonte = audio.createMediaElementSource(video);
      fonte.connect(destino);
      await audio.resume();

      const desenhar = () => {
        if (video.paused || video.ended) return;
        contexto.fillStyle = "#000";
        contexto.fillRect(0, 0, canvas.width, canvas.height);
        const escala = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
        const largura = video.videoWidth * escala;
        const altura = video.videoHeight * escala;
        contexto.drawImage(video, (canvas.width - largura) / 2, (canvas.height - altura) / 2, largura, altura);
        requestAnimationFrame(desenhar);
      };
      const acabou = esperar(video, "ended");
      await video.play();
      desenhar();
      await acabou;
      fonte.disconnect();
      onProgress?.(Math.round(((indice + 1) / clipes.length) * 100));
    }
  } finally {
    gravador.stop();
    stream.getTracks().forEach((track) => track.stop());
    await audio.close();
  }
  return finalizado;
}

export function baixarBlob(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}