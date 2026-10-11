import { createFileRoute } from "@tanstack/react-router";
import { GeneratorTool } from "@/components/GeneratorTool";

export const Route = createFileRoute("/_authenticated/paginas")({
  head: () => ({ meta: [
    { title: "Gerador de Páginas — T@arte" },
    { name: "description", content: "Crie páginas com IA e baixe em HTML." },
    { property: "og:title", content: "Gerador de Páginas — T@arte" },
    { property: "og:description", content: "Crie páginas com IA e baixe em HTML." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <GeneratorTool mode="paginas" />,
});
