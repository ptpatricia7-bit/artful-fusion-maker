import { createFileRoute } from "@tanstack/react-router";
import { GeneratorTool } from "@/components/GeneratorTool";

export const Route = createFileRoute("/_authenticated/banner")({
  head: () => ({ meta: [
    { title: "Gerador de Banner — T@arte" },
    { name: "description", content: "Crie banners publicitários com IA para baixar." },
    { property: "og:title", content: "Gerador de Banner — T@arte" },
    { property: "og:description", content: "Crie banners publicitários com IA para baixar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <GeneratorTool mode="banner" />,
});
