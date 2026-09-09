import { Link } from "@tanstack/react-router";

const ferramentas = [
  { to: "/painel", label: "Painel" },
  { to: "/produtos", label: "Produtos e vídeos" },
  { to: "/estudio", label: "Multiplicador" },
  { to: "/roteirizador", label: "Roteirizador IA" },
  { to: "/cabine", label: "Cabine de roupas" },
  { to: "/spy", label: "GeraSpy ADS" },
  { to: "/criadores", label: "Criadores" },
  { to: "/cofre", label: "Cofre de prompts" },
  { to: "/indique", label: "Indique e ganhe" },
] as const;

export function AppNav() {
  return (
    <div className="border-b border-border bg-card/40">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 py-2.5">
        {ferramentas.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            {f.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
