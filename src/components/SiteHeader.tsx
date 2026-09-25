import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const links = [
  { to: "/", label: "Início" },
  { to: "/painel", label: "Painel" },
  { to: "/estudio", label: "Estúdio" },
  { to: "/planos", label: "Planos" },
  { to: "/faq", label: "FAQ" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/entrar", replace: true });
  };

  const displayName =
    typeof user?.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim()
      ? user.user_metadata.display_name
      : user?.email?.split("@")[0];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-neon font-display text-sm font-bold text-primary-foreground">
            T
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            T<span className="text-gradient">@</span>arte
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-sm text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden min-w-36 items-center justify-end gap-2 md:flex">
          {!loading && user ? (
            <>
              <Link to="/painel" className="flex max-w-40 items-center gap-2 truncate text-sm text-muted-foreground hover:text-foreground">
                <UserRound className="h-4 w-4 shrink-0" />
                <span className="truncate">{displayName}</span>
              </Link>
              <Button size="icon" variant="ghost" onClick={signOut} aria-label="Sair da conta" title="Sair da conta">
                <LogOut />
              </Button>
            </>
          ) : !loading ? (
            <>
              <Link to="/entrar" className="text-sm text-muted-foreground hover:text-foreground">Entrar</Link>
              <Link to="/planos" className="rounded-full bg-gradient-neon px-4 py-2 text-sm font-semibold text-primary-foreground">Garantir acesso</Link>
            </>
          ) : null}
        </div>

        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="md:hidden"
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <div className="border-t border-border px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm">
                {l.label}
              </Link>
            ))}
            {!loading && user ? (
              <>
                <Link to="/painel" onClick={() => setOpen(false)} className="text-sm">Minha conta: {displayName}</Link>
                <Button variant="outline" onClick={signOut} className="justify-start"><LogOut />Sair</Button>
              </>
            ) : !loading ? (
              <Link to="/entrar" onClick={() => setOpen(false)} className="text-sm">Entrar</Link>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
