export function AiResultado({
  texto,
  carregando,
  erro,
  vazio,
}: {
  texto: string | null;
  carregando: boolean;
  erro: string | null;
  vazio: string;
}) {
  if (carregando) {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-3.5 animate-pulse rounded-full bg-secondary"
            style={{ width: `${90 - i * 12}%` }}
          />
        ))}
        <p className="pt-2 text-[13px] text-primary">A inteligência artificial está escrevendo…</p>
      </div>
    );
  }
  if (erro) {
    return (
      <p className="rounded-xl border border-destructive/40 px-4 py-3 text-[13.5px] text-destructive">
        {erro}
      </p>
    );
  }
  if (!texto) return <p className="text-sm text-muted-foreground">{vazio}</p>;
  return (
    <div className="space-y-3 text-[14px] leading-relaxed whitespace-pre-wrap">{texto}</div>
  );
}
