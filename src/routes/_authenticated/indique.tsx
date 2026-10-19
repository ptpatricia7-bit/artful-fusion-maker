import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AppNav } from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/indique")({
  head: () => ({
    meta: [
      { title: "Afiliados: saldo e link exclusivo — T@arte" },
      {
        name: "description",
        content:
          "Seu link exclusivo de afiliado do T@arte, saldo de comissões em dinheiro e chave Pix para resgate.",
      },
      { property: "og:title", content: "Afiliados T@arte — comissão em dinheiro" },
      {
        property: "og:description",
        content: "Indique o T@arte e ganhe comissão em dinheiro em 2 níveis, só sobre vendas reais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Afiliados,
});

type Comissao = {
  id: string;
  level: number;
  amount_cents: number;
  status: string;
  description: string;
  created_at: string;
};

const brl = (c: number) =>
  (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusLabel: Record<string, string> = {
  pendente: "A liberar",
  disponivel: "Disponível",
  pago: "Pago",
  cancelado: "Cancelado",
};

function Afiliados() {
  const [code, setCode] = useState<string | null>(null);
  const [pix, setPix] = useState("");
  const [pixMsg, setPixMsg] = useState<string | null>(null);
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [contagem, setContagem] = useState({ nivel1: 0, nivel2: 0 });
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data: af, error } = await supabase.rpc("ensure_affiliate", {});
      if (error || !af) {
        setErro("Não foi possível carregar seu link agora. Tente novamente.");
        return;
      }
      setCode(af.code);
      setPix(af.pix_key ?? "");
      const [{ data: c }, { data: n }] = await Promise.all([
        supabase
          .from("affiliate_commissions")
          .select("id, level, amount_cents, status, description, created_at")
          .order("created_at", { ascending: false }),
        supabase.rpc("affiliate_referral_counts"),
      ]);
      setComissoes(c ?? []);
      const row = Array.isArray(n) ? n[0] : null;
      if (row) setContagem({ nivel1: Number(row.nivel1), nivel2: Number(row.nivel2) });
    })();
  }, []);

  const soma = (s: string) =>
    comissoes.filter((c) => c.status === s).reduce((t, c) => t + c.amount_cents, 0);
  const link = code ? `${typeof window !== "undefined" ? window.location.origin : ""}/entrar?ref=${code}` : "";

  const salvarPix = async () => {
    setPixMsg(null);
    const { error } = await supabase.rpc("set_affiliate_pix", { p_pix: pix });
    setPixMsg(error ? "Não foi possível salvar. Confira a chave." : "Chave Pix salva.");
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AppNav />
      <div className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">Afiliados T@arte</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] text-muted-foreground">
          Indique o T@arte com seu link exclusivo e ganhe comissão em dinheiro, em 2 níveis, somente
          sobre vendas reais.
        </p>

        {erro && <p className="mt-6 rounded-2xl border border-destructive/40 p-4 text-sm text-destructive">{erro}</p>}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Disponível", soma("disponivel")],
            ["A liberar", soma("pendente")],
            ["Já recebido", soma("pago")],
          ].map(([t, v]) => (
            <div key={t as string} className="glass rounded-2xl p-5">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">{t}</p>
              <p className="mt-2 font-display text-2xl font-bold">{brl(v as number)}</p>
            </div>
          ))}
        </div>

        <div className="glass mt-6 rounded-3xl p-6">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Seu link exclusivo</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <code className="flex-1 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm break-all">
              {link || "Carregando…"}
            </code>
            <button
              disabled={!link}
              onClick={() => {
                void navigator.clipboard.writeText(link);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1800);
              }}
              className="rounded-full bg-gradient-neon px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {copiado ? "Copiado!" : "Copiar link"}
            </button>
            {link && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Conheça o T@arte: ${link}`)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border px-5 py-3 text-sm font-semibold"
              >
                WhatsApp
              </a>
            )}
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Indicados diretos: {contagem.nivel1} · Indicados dos seus indicados: {contagem.nivel2}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="glass rounded-2xl p-5">
            <p className="font-semibold">Nível 1 — indicação direta</p>
            <p className="text-[13px] text-muted-foreground">Comissão sobre cada venda real feita por quem entrou pelo seu link.</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="font-semibold">Nível 2 — indicados dos indicados</p>
            <p className="text-[13px] text-muted-foreground">Comissão menor sobre vendas reais de quem seus indicados trouxeram.</p>
          </div>
        </div>

        <div className="glass mt-6 rounded-3xl p-6">
          <p className="font-semibold">Chave Pix para receber</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <input
              value={pix}
              maxLength={140}
              onChange={(e) => setPix(e.target.value)}
              placeholder="CPF, e-mail, telefone ou chave aleatória"
              className="flex-1 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm"
            />
            <button onClick={salvarPix} className="rounded-full bg-gradient-neon px-5 py-3 text-sm font-semibold text-primary-foreground">
              Salvar chave
            </button>
          </div>
          {pixMsg && <p className="mt-2 text-[13px] text-muted-foreground">{pixMsg}</p>}
        </div>

        <div className="mt-6">
          <h2 className="font-display text-xl font-bold">Extrato</h2>
          {comissoes.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-border p-4 text-[13px] text-muted-foreground">
              Nenhuma comissão ainda. Elas aparecem aqui quando houver vendas reais pelos seus links.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {comissoes.map((c) => (
                <div key={c.id} className="glass flex items-center justify-between rounded-2xl px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold">{c.description || `Comissão nível ${c.level}`}</p>
                    <p className="text-[12px] text-muted-foreground">
                      Nível {c.level} · {new Date(c.created_at).toLocaleDateString("pt-BR")} · {statusLabel[c.status] ?? c.status}
                    </p>
                  </div>
                  <p className="font-semibold">{brl(c.amount_cents)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
