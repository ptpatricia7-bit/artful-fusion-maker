import { createFileRoute } from "@tanstack/react-router";
import { GeneratorTool } from "@/components/GeneratorTool";

export const Route = createFileRoute("/_authenticated/audio")({
  head: () => ({ meta: [
    { title: "Gerador de Áudio — T@arte" },
    { name: "description", content: "Transforme texto em narração com IA e baixe o áudio." },
    { property: "og:title", content: "Gerador de Áudio — T@arte" },
    { property: "og:description", content: "Transforme texto em narração com IA e baixe o áudio." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <GeneratorTool mode="audio" />,
});
