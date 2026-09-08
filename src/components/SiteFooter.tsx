import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 text-center">
        <span className="font-display text-base font-semibold">
          T<span className="text-gradient">@</span>arte
        </span>
        <p className="max-w-md text-[13px] text-muted-foreground">
          Métricas reais do TikTok Shop Brasil e o Multiplicador de Vídeos. Os números exibidos são
          demonstrativos.
        </p>
        <div className="flex gap-5 text-[13px] text-muted-foreground">
          <Link to="/planos">Planos</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/entrar">Entrar</Link>
        </div>
        <p className="text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} T@arte · 7 dias de garantia
        </p>
      </div>
    </footer>
  );
}
