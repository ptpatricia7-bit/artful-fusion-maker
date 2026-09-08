import { Link } from "@tanstack/react-router";
import { useState } from "react";

const links = [
  { to: "/", label: "Início" },
  { to: "/painel", label: "Painel" },
  { to: "/estudio", label: "Estúdio" },
  { to: "/planos", label: "Planos" },
  { to: "/faq", label: "FAQ" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

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

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/entrar" className="text-sm text-muted-foreground hover:text-foreground">
            Entrar
          </Link>
          <Link
            to="/planos"
            className="rounded-full bg-gradient-neon px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Garantir acesso
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
          className="rounded-lg border border-border px-3 py-2 text-sm md:hidden"
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm">
                {l.label}
              </Link>
            ))}
            <Link to="/entrar" onClick={() => setOpen(false)} className="text-sm">
              Entrar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
