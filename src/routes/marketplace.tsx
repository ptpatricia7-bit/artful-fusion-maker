import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — T@arte" },
      { name: "description", content: "Produtos digitais e físicos de criadores e comércios parceiros do T@arte." },
      { property: "og:title", content: "Marketplace — T@arte" },
      { property: "og:description", content: "Vitrine de produtos de criadores e comércios parceiros." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Marketplace,
});

export const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Marketplace() {
  const [tipo, setTipo] = useState<"todos" | "digital" | "fisico">("todos");
  const { data, isLoading, error } = useQuery({
    queryKey: ["marketplace", "publicados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_products")
        .select("id,title,description,kind,category,price_cents,image_url,contact_url,seller_name")
        .eq("status", "publicado")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
  const lista = (data ?? []).filter((p) => tipo === "todos" || p.kind === tipo);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Marketplace <span className="text-gradient">T@arte</span></h1>
            <p className="mt-2 text-muted-foreground">Produtos de criadores e comércios parceiros.</p>
          </div>
          <Link to="/vender" className="rounded-full bg-gradient-neon px-5 py-2.5 text-sm font-semibold text-primary-foreground">Quero vender</Link>
        </div>
        <div className="mt-6 flex gap-2">
          {(["todos", "digital", "fisico"] as const).map((t) => (
            <button key={t} onClick={() => setTipo(t)} className={`rounded-full px-4 py-1.5 text-sm ${tipo === t ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
              {t === "todos" ? "Todos" : t === "digital" ? "Digitais" : "Físicos"}
            </button>
          ))}
        </div>
        {isLoading && <p className="mt-10 text-muted-foreground">Carregando produtos…</p>}
        {error && <p className="mt-10 text-destructive">Não foi possível carregar a vitrine agora.</p>}
        {!isLoading && !error && lista.length === 0 && (
          <p className="mt-10 rounded-xl border border-border p-8 text-center text-muted-foreground">Nenhum produto publicado ainda. Seja o primeiro a vender!</p>
        )}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((p) => (
            <article key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              {p.image_url ? <img src={p.image_url} alt={p.title} className="aspect-video w-full object-cover" loading="lazy" /> : <div className="aspect-video bg-secondary" />}
              <div className="p-5">
                <p className="text-xs text-muted-foreground">{p.category} · {p.kind === "digital" ? "Digital" : "Físico"}</p>
                <h2 className="mt-1 font-display text-lg font-semibold">{p.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-xl font-bold">{brl(p.price_cents)}</span>
                  {p.contact_url && <a href={p.contact_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-secondary px-4 py-1.5 text-sm">Comprar</a>}
                </div>
                {p.seller_name && <p className="mt-3 text-xs text-muted-foreground">Vendido por {p.seller_name}</p>}
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
