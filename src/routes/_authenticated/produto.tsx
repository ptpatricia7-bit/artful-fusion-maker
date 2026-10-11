import { createFileRoute } from "@tanstack/react-router";
import { GeneratorTool } from "@/components/GeneratorTool";

export const Route = createFileRoute("/_authenticated/produto")({
  head: () => ({ meta: [
    { title: "Gerador de Produto — T@arte" },
    { name: "description", content: "Crie propostas de produtos com IA para copiar e baixar." },
    { property: "og:title", content: "Gerador de Produto — T@arte" },
    { property: "og:description", content: "Crie propostas de produtos com IA para copiar e baixar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <GeneratorTool mode="produto" />,
});
