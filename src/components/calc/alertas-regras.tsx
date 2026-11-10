import { formatDateBr } from '@/lib/regras/dates';
import type { RegraResolvida } from '@/lib/regras/resolver';

/** Warnings that keep users from trusting a value blindly (stale, estimated or proposed rules). */
export function AlertasRegras({ regras }: { regras: RegraResolvida<unknown>[] }) {
  const desatualizada = regras.some((r) => r.alertas.includes('sem-versao-vigente') || r.alertas.includes('verificacao-vencida'));
  const estimadas = regras.filter((r) => r.alertas.includes('valor-estimado'));
  const previstas = regras.filter((r) => r.alertas.includes('valor-previsto'));

  if (!desatualizada && estimadas.length === 0 && previstas.length === 0) return null;

  return (
    <div className="space-y-2" role="status">
      {desatualizada && (
        <p className="rounded-2xl border-2 border-tinta bg-amarelo-claro p-3 text-sm leading-snug">
          <strong className="block">Estamos verificando atualizações recentes da lei.</strong>
          Os valores podem estar desatualizados. Confira as fontes oficiais abaixo.
        </p>
      )}
      {estimadas.map((r) => (
        <p key={`${r.id}-${r.versao.vigenteDesde}`} className="rounded-2xl border-2 border-tinta bg-amarelo-claro p-3 text-sm leading-snug">
          <strong className="block">Valor estimado: {r.titulo.toLowerCase()}</strong>
          {r.versao.nota}
        </p>
      ))}
      {previstas.map((r) => (
        <p key={`${r.id}-${r.versao.vigenteDesde}`} className="rounded-2xl border-2 border-tinta bg-amarelo-claro p-3 text-sm leading-snug">
          <strong className="block">Valor previsto a partir de {formatDateBr(r.versao.vigenteDesde)}</strong>
          {r.versao.nota}
        </p>
      ))}
    </div>
  );
}
