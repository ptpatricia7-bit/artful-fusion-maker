import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/vender")({
  head: () => ({
    meta: [
      { title: "Meus produtos — Marketplace T@arte" },
      { name: "description", content: "Cadastre e publique seus produtos no Marketplace T@arte." },
      { property: "og:title", content: "Meus produtos — Marketplace T@arte" },
      { property: "og:description", content: "Painel do vendedor do Marketplace T@arte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Vender,
});

const vazio = { title: "", description: "", kind: "digital", category: "", preco: "", image_url: "", contact_url: "" };
const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const campo = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

function Vender() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [f, setF] = useState(vazio);
  const [erro, setErro] = useState("");

  const { data } = useQuery({
    queryKey: ["marketplace", "meus", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_products").select("*").eq("seller_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const atualizar = () => qc.invalidateQueries({ queryKey: ["marketplace"] });

  const criar = useMutation({
    mutationFn: async () => {
      const preco = Math.round(Number(f.preco.replace(",", ".")) * 100);
      if (f.title.trim().length < 3) throw new Error("Dê um nome com pelo menos 3 letras.");
      if (!Number.isFinite(preco) || preco < 100) throw new Error("O preço mínimo é R$ 1,00.");
      for (const u of [f.image_url, f.contact_url]) if (u && !u.startsWith("https://")) throw new Error("Os links precisam começar com https://");
      const nome = (user?.user_metadata?.["display_name"] as string | undefined) || user?.email?.split("@")[0] || "";
      const { error } = await supabase.from("marketplace_products").insert({
        seller_id: user!.id, seller_name: nome, title: f.title.trim(), description: f.description.trim(), kind: f.kind,
        category: f.category.trim() || "Outros", price_cents: preco, image_url: f.image_url || null, contact_url: f.contact_url || null,
      });
      if (error) throw new Error("Não foi possível salvar. Confira os campos.");
    },
    onSuccess: () => { setF(vazio); setErro(""); atualizar(); },
    onError: (e: Error) => setErro(e.message),
  });

  const alternar = async (id: string, status: string) => {
    await supabase.from("marketplace_products").update({ status: status === "publicado" ? "rascunho" : "publicado" }).eq("id", id);
    atualizar();
  };
  const excluir = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    await supabase.from("marketplace_products").delete().eq("id", id);
    atualizar();
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-3xl font-bold">Meus produtos</h1>
          <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-foreground">Ver vitrine →</Link>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">O pagamento ainda é combinado pelo seu link de compra. Cobrança e comissões no app virão na próxima etapa.</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
          <form onSubmit={(e) => { e.preventDefault(); criar.mutate(); }} className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display font-semibold">Novo produto</h2>
            <input className={campo} placeholder="Nome do produto" value={f.title} maxLength={120} onChange={(e) => setF({ ...f, title: e.target.value })} />
            <textarea className={campo} rows={4} placeholder="Descrição" value={f.description} maxLength={2000} onChange={(e) => setF({ ...f, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className={campo} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
                <option value="digital">Digital</option>
                <option value="fisico">Físico</option>
              </select>
              <input className={campo} placeholder="Preço (R$)" inputMode="decimal" value={f.preco} onChange={(e) => setF({ ...f, preco: e.target.value })} />
            </div>
            <input className={campo} placeholder="Categoria (ex.: Curso, Moda)" value={f.category} maxLength={60} onChange={(e) => setF({ ...f, category: e.target.value })} />
            <input className={campo} placeholder="Link da imagem (https://…)" value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} />
            <input className={campo} placeholder="Link de compra ou WhatsApp (https://…)" value={f.contact_url} onChange={(e) => setF({ ...f, contact_url: e.target.value })} />
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            <Button type="submit" className="w-full" disabled={criar.isPending}>{criar.isPending ? "Salvando…" : "Salvar como rascunho"}</Button>
          </form>

          <div className="space-y-3">
            {(data ?? []).length === 0 && <p className="rounded-xl border border-border p-8 text-center text-muted-foreground">Você ainda não cadastrou produtos.</p>}
            {(data ?? []).map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{brl(p.price_cents)} · {p.status === "publicado" ? "Publicado" : "Rascunho"}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant={p.status === "publicado" ? "outline" : "default"} onClick={() => alternar(p.id, p.status)}>
                    {p.status === "publicado" ? "Despublicar" : "Publicar"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => excluir(p.id)}>Excluir</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
