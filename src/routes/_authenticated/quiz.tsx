import { createFileRoute } from "@tanstack/react-router";
import { GeneratorTool } from "@/components/GeneratorTool";

export const Route = createFileRoute("/_authenticated/quiz")({
  head: () => ({ meta: [
    { title: "Criador de quiz — T@arte" },
    { name: "description", content: "Crie quizzes interativos com IA e baixe em HTML." },
    { property: "og:title", content: "Criador de quiz — T@arte" },
    { property: "og:description", content: "Crie quizzes interativos com IA e baixe em HTML." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <GeneratorTool mode="quiz" />,
});
