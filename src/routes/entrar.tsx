import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

type Search = { redirecionar?: string | undefined };

export const Route = createFileRoute("/entrar")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    redirecionar: typeof search['redirecionar'] === "string" ? search['redirecionar'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar no T@arte" },
      {
        name: "description",
        content: "Acesse seu painel do T@arte para ver o ranking do TikTok Shop e o Estúdio.",
      },
      { property: "og:title", content: "Entrar no T@arte" },
      { property: "og:description", content: "Acesse o painel e o Estúdio do T@arte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const router = useRouter();
  const search = Route.useSearch();
  const { user, loading: checkingSession } = useAuth();
  const [mode, setMode] = useState<"entrar" | "cadastro" | "recuperar">("entrar");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const destination = (() => {
    if (!search.redirecionar) return "/painel";
    try {
      const url = new URL(search.redirecionar, window.location.origin);
      return url.origin === window.location.origin && url.pathname.startsWith("/")
        ? `${url.pathname}${url.search}${url.hash}`
        : "/painel";
    } catch {
      return "/painel";
    }
  })();

  useEffect(() => {
    if (!checkingSession && user) void router.navigate({ href: destination, replace: true });
  }, [checkingSession, destination, router, user]);

  const friendlyError = (authMessage: string) => {
    if (authMessage.toLowerCase().includes("invalid login credentials")) return "E-mail ou senha incorretos.";
    if (authMessage.toLowerCase().includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
    if (authMessage.toLowerCase().includes("already registered")) return "Este e-mail já possui uma conta.";
    if (authMessage.toLowerCase().includes("password")) return "Use uma senha com pelo menos 8 caracteres.";
    if (authMessage.toLowerCase().includes("rate limit")) return "Muitas tentativas seguidas. Aguarde alguns minutos.";
    return "Não foi possível continuar agora. Tente novamente.";
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "recuperar") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (resetError) setError(friendlyError(resetError.message));
      else setMessage("Enviamos o link para criar uma nova senha. Confira seu e-mail.");
      return;
    }

    if (password.length < 8) {
      setLoading(false);
      setError("Use uma senha com pelo menos 8 caracteres.");
      return;
    }

    if (mode === "cadastro") {
      if (displayName.trim().length < 2) {
        setLoading(false);
        setError("Digite seu nome.");
        return;
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: displayName.trim() },
        },
      });
      setLoading(false);
      if (signUpError) {
        setError(friendlyError(signUpError.message));
        return;
      }
      if (!data.session) {
        setMessage("Conta criada. Confira seu e-mail e confirme o cadastro antes de entrar.");
        return;
      }
      await router.navigate({ href: destination, replace: true });
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(friendlyError(signInError.message));
      return;
    }
    await router.navigate({ href: destination, replace: true });
  };

  const changeMode = (nextMode: "entrar" | "cadastro" | "recuperar") => {
    setMode(nextMode);
    setError(null);
    setMessage(null);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="aurora flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-12">
        <div className="glass w-full max-w-md rounded-lg p-6 sm:p-8">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold">
            {mode === "cadastro" ? "Criar sua conta" : mode === "recuperar" ? "Recuperar senha" : "Entrar"}
          </h1>
          <p className="mt-2 text-[13.5px] text-muted-foreground">
            {mode === "cadastro"
              ? "Cadastre seus dados para acessar todas as ferramentas."
              : mode === "recuperar"
                ? "Digite seu e-mail para receber o link de recuperação."
                : "Use seu e-mail e senha para acessar o T@arte."}
          </p>
          <form
            className="mt-7 space-y-4"
            onSubmit={submit}
          >
            {mode === "cadastro" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground" htmlFor="nome">Nome</label>
                <input id="nome" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required autoComplete="name" placeholder="Como você quer ser chamada" className="mt-1.5 w-full rounded-md border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="email">
                E-mail
              </label>
              <span className="relative mt-1.5 block">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="voce@email.com" className="w-full rounded-md border border-input bg-secondary/40 py-2.5 pr-3 pl-10 text-sm outline-none focus:border-primary" />
              </span>
            </div>
            {mode !== "recuperar" && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="senha">Senha</label>
                  {mode === "entrar" && <button type="button" onClick={() => changeMode("recuperar")} className="text-xs font-medium text-primary">Esqueci minha senha</button>}
                </div>
                <span className="relative mt-1.5 block">
                  <input id="senha" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === "cadastro" ? "new-password" : "current-password"} placeholder="Mínimo de 8 caracteres" className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2.5 pr-11 text-sm outline-none focus:border-primary" />
                  <Button type="button" size="icon" variant="ghost" className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </span>
              </div>
            )}
            {error && <p className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-[13px] text-destructive" role="alert">{error}</p>}
            {message && <p className="rounded-md border border-primary/40 bg-primary/5 px-4 py-3 text-[13px] text-primary" role="status">{message}</p>}
            <Button type="submit" disabled={loading || checkingSession} className="h-11 w-full font-semibold">
              {loading ? "Aguarde…" : mode === "cadastro" ? "Criar conta" : mode === "recuperar" ? "Enviar link" : "Entrar no painel"}
            </Button>
          </form>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted-foreground">
            {mode === "entrar" ? (
              <button type="button" onClick={() => changeMode("cadastro")} className="font-medium text-primary">Criar uma conta</button>
            ) : (
              <button type="button" onClick={() => changeMode("entrar")} className="font-medium text-primary">Voltar para entrar</button>
            )}
            <Link to="/planos">Ver os planos</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
