import { daysBetween, type IsoDate } from './dates';
import type { Regra, Versao } from './schema';

/** After this many days without a human check, the UI warns that values may be outdated. */
export const DIAS_ATE_VERIFICACAO_VENCIDA = 45;

export type Alerta =
  /** No version covers the date: we fall back to the latest known one. */
  | 'sem-versao-vigente'
  /** The version was not checked against official sources recently. */
  | 'verificacao-vencida'
  /** The value is only proposed (not yet in an official act). */
  | 'valor-previsto'
  /** The value is our reading of the law, pending official regulation. */
  | 'valor-estimado';

export type RegraResolvida<T> = {
  id: string;
  titulo: string;
  data: IsoDate;
  versao: Versao<T>;
  valor: T;
  /** Next scheduled version after `data`, to announce upcoming changes. */
  proxima?: Versao<T>;
  alertas: Alerta[];
};

function byStart<T>(a: Versao<T>, b: Versao<T>) {
  return a.vigenteDesde.localeCompare(b.vigenteDesde);
}

function covers<T>(versao: Versao<T>, data: IsoDate) {
  return versao.vigenteDesde <= data && (!versao.vigenteAte || data <= versao.vigenteAte);
}

/**
 * Picks the version of a rule that applies on `data`.
 * Never throws for a date after the first version: if the known versions have expired,
 * it returns the latest one flagged `sem-versao-vigente`, so the UI can still compute and warn.
 * Freshness is measured against `hoje` (today), not `data`: simulating a future date is not a reason to warn.
 */
export function resolverRegra<T>(regra: Regra<T>, data: IsoDate, hoje: IsoDate = data): RegraResolvida<T> {
  const versoes = [...regra.versoes].sort(byStart);
  const iniciadas = versoes.filter((v) => v.vigenteDesde <= data);
  if (iniciadas.length === 0) {
    throw new Error(`Rule ${regra.id} has no version on or before ${data}`);
  }

  const vigente = [...iniciadas].reverse().find((v) => covers(v, data));
  const versao = vigente ?? iniciadas[iniciadas.length - 1];

  const alertas: Alerta[] = [];
  if (!vigente) alertas.push('sem-versao-vigente');
  if (daysBetween(versao.verificadoEm, hoje) > DIAS_ATE_VERIFICACAO_VENCIDA) {
    alertas.push('verificacao-vencida');
  }
  if (versao.situacao === 'proposta') alertas.push('valor-previsto');
  if (versao.situacao === 'interpretacao') alertas.push('valor-estimado');

  return {
    id: regra.id,
    titulo: regra.titulo,
    data,
    versao,
    valor: versao.valor,
    proxima: versoes.find((v) => v.vigenteDesde > data),
    alertas,
  };
}
