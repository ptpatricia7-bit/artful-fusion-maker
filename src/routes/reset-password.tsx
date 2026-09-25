import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Criar nova senha — T@arte" },
      { name: "description", content: "Crie uma nova senha segura para acessar sua conta T@arte." },
      { property: "og:title", content: "Criar nova senha — T@arte" },
      { property: "og:description", content: "Recupere o acesso à sua conta T@arte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(true);
  const [validRecovery, setValidRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const recoveryLink = new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";
    void supabase.auth.getUser().then(({ data }) => {
      setValidRecovery(recoveryLink && Boolean(data.user));
      setChecking(false);
    });
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas digitadas não são iguais.");
      return;
    }

    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError("Não foi possível atualizar a senha. Solicite um novo link.");
      return;
    }
    setMessage("Senha atualizada. Você já pode entrar na sua conta.");
    window.setTimeout(() => void navigate({ to: "/entrar", replace: true }), 1400);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="aurora flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-12">
        <section className="glass w-full max-w-md rounded-lg p-6 sm:p-8">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold">Criar nova senha</h1>
          <p className="mt-2 text-sm text-muted-foreground">Escolha uma nova senha para sua conta.</p>

          {checking ? (
            <p className="mt-6 text-sm text-muted-foreground">Verificando seu link…</p>
          ) : !validRecovery ? (
            <div className="mt-6">
              <p className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                Este link é inválido ou expirou. Solicite outro link de recuperação.
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/entrar">Voltar para entrar</Link>
              </Button>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <label className="block text-xs font-medium text-muted-foreground" htmlFor="nova-senha">
                Nova senha
                <span className="relative mt-1.5 block">
                  <input
                    id="nova-senha"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2.5 pr-11 text-sm text-foreground outline-none focus:border-primary"
                  />
                  <Button type="button" size="icon" variant="ghost" className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </span>
              </label>
              <label className="block text-xs font-medium text-muted-foreground" htmlFor="confirmar-senha">
                Confirmar nova senha
                <input id="confirmar-senha" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              </label>
              {error && <p className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{error}</p>}
              {message && <p className="rounded-md border border-primary/40 bg-primary/5 px-4 py-3 text-sm text-primary" role="status">{message}</p>}
              <Button type="submit" disabled={loading} className="h-11 w-full font-semibold">
                {loading ? "Atualizando…" : "Salvar nova senha"}
              </Button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}