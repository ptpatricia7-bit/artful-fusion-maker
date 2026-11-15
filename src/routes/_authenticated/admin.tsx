import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel do administrador — T@arte" },
      { name: "description", content: "Ajuste planos, níveis da rede e comissões do T@arte." },
      { property: "og:title", content: "Painel do administrador — T@arte" },
      { property: "og:description", content: "Configurações de planos e comissões do T@arte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const campo = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

function Admin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");

  const isAdmin = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
      return !!data;
    },
  });

  const cfg = useQuery({
    queryKey: ["admin", "config"],
    enabled: isAdmin.data === true,
    queryFn: async () => {
      const [c, p] = await Promise.all([
        supabase.from("commission_settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("subscription_plans").select("*").order("billing_months"),
      ]);
      if (c.error) throw c.error;
      if (p.error) throw p.error;
      return { comissao: c.data, planos: p.data ?? [] };
    },
  });

  const [c, setC] = useState({ network_depth: 2, l1: "30", l2: "10", hold: "7", enabled: false });
  const [planos, setPlanos] = useState<{ id: string; name: string; preco: string; active: boolean }[]>([]);

  useEffect(() => {
    if (!cfg.data) return;
    const k = cfg.data.comissao;
    if (k) setC({ network_depth: k.network_depth, l1: String(k.level1_bps / 100), l2: String(k.level2_bps / 100), hold: String(k.hold_days), enabled: k.enabled });
    setPlanos(cfg.data.planos.map((p) => ({ id: p.id, name: p.name, preco: (p.price_cents / 100).toFixed(2), active: p.active })));
  }, [cfg.data]);

  const salvar = useMutation({
    mutationFn: async () => {
      const l1 = Math.round(Number(c.l1) * 100), l2 = c.network_depth === 2 ? Math.round(Number(c.l2) * 100) : 0;
      if (!(l1 >= 0 && l2 >= 0 && l1 + l2 < 10000)) throw new Error("A soma das comissões precisa ser menor que 100%.");
      if (!(Number(c.hold) >= 7)) throw new Error("A carência mínima é de 7 dias.");
      const { error } = await supabase.from("commission_settings").upsert({ id: 1, network_depth: c.network_depth, level1_bps: l1, level2_bps: l2, hold_days: Number(c.hold), enabled: c.enabled });
      if (error) throw new Error("Não foi possível salvar as comissões.");
      for (const p of planos) {
        const cents = Math.round(Number(p.preco.replace(",", ".")) * 100);
        if (!(cents >= 0)) throw new Error(`Preço inválido em ${p.name}.`);
        const { error: e } = await supabase.from("subscription_plans").update({ name: p.name, price_cents: cents, active: p.active }).eq("id", p.id);
        if (e) throw new Error(`Não foi possível salvar o plano ${p.name}.`);
      }
    },
    onSuccess: () => { setMsg("Alterações salvas."); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: Error) => setMsg(e.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <AppNav />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-display text-3xl font-semibold">Painel do administrador</h1>
        {isAdmin.isLoading ? (
          <p className="mt-6 text-muted-foreground">Verificando acesso…</p>
        ) : !isAdmin.data ? (
          <p className="mt-6 rounded-xl border border-border bg-card p-5 text-muted-foreground">
            Esta área é só para administradores. Sua conta ainda não tem esse acesso.
          </p>
        ) : (
          <div className="mt-8 space-y-8">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold">Rede e comissões</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm">Níveis da rede
                  <select className={campo} value={c.network_depth} onChange={(e) => setC({ ...c, network_depth: Number(e.target.value) })}>
                    <option value={1}>1 nível</option><option value={2}>2 níveis</option>
                  </select>
                </label>
                <label className="text-sm">Carência (dias)
                  <input className={campo} type="number" min={7} value={c.hold} onChange={(e) => setC({ ...c, hold: e.target.value })} />
                </label>
                <label className="text-sm">Comissão nível 1 (%)
                  <input className={campo} type="number" step="0.1" value={c.l1} onChange={(e) => setC({ ...c, l1: e.target.value })} />
                </label>
                <label className="text-sm">Comissão nível 2 (%)
                  <input className={campo} type="number" step="0.1" disabled={c.network_depth === 1} value={c.l2} onChange={(e) => setC({ ...c, l2: e.target.value })} />
                </label>
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={c.enabled} onChange={(e) => setC({ ...c, enabled: e.target.checked })} />
                Comissões ativas (passam a valer quando a cobrança real estiver ligada)
              </label>
            </section>
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold">Planos</h2>
              <div className="mt-4 space-y-3">
                {planos.map((p, i) => (
                  <div key={p.id} className="grid items-center gap-3 sm:grid-cols-[1fr_140px_auto]">
                    <input className={campo} value={p.name} onChange={(e) => setPlanos(planos.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                    <input className={campo} value={p.preco} onChange={(e) => setPlanos(planos.map((x, j) => j === i ? { ...x, preco: e.target.value } : x))} />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={p.active} onChange={(e) => setPlanos(planos.map((x, j) => j === i ? { ...x, active: e.target.checked } : x))} /> Ativo
                    </label>
                  </div>
                ))}
              </div>
            </section>
            <div className="flex items-center gap-4">
              <Button onClick={() => { setMsg(""); salvar.mutate(); }} disabled={salvar.isPending}>
                {salvar.isPending ? "Salvando…" : "Salvar alterações"}
              </Button>
              {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
