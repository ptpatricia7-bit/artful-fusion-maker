import { createFileRoute } from "@tanstack/react-router";
import { ConversationGenerator } from "@/components/ConversationGenerator";

export const Route = createFileRoute("/_authenticated/conversas")({
  head: () => ({ meta: [
    { title: "Gerador de Conversas do WhatsApp — T@arte" },
    { name: "description", content: "Crie e edite imagens de conversas fictícias do WhatsApp, identificadas como simulação, para baixar." },
    { property: "og:title", content: "Gerador de Conversas do WhatsApp — T@arte" },
    { property: "og:description", content: "Imagens editáveis de conversas ilustrativas com download em PNG." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ConversationGenerator,
});