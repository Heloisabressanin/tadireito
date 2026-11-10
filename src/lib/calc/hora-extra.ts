import { regras } from '@/lib/regras/catalogo';
import type { IsoDate } from '@/lib/regras/dates';
import { resolverRegra, type RegraResolvida } from '@/lib/regras/resolver';
import type { Versao } from '@/lib/regras/schema';
import type { DivisorValor, JornadaValor } from '@/lib/regras/catalogo';
import { arredondar } from './dinheiro';

/** Constitution, art. 7º, XVI and CLT art. 59 §1º: at least 50% more than the normal hour. */
export const ADICIONAL_MINIMO = 0.5;

export type LancamentoHoraExtra = {
  quantidade: number;
  /** 0.5 for 50%, 1 for 100%… Collective agreements may set more than the legal minimum. */
  adicional: number;
};

export type EntradaHoraExtra = {
  salarioBruto: number;
  horasExtras: LancamentoHoraExtra[];
  /** Weekly hours. If omitted, the legal maximum in force on the date is used. */
  jornadaSemanal?: number;
  /** Working days and rest days (Sundays + holidays + other rest days) in the month, to compute the DSR. */
  dsr?: { diasUteis: number; diasDeDescanso: number };
};

export type ResultadoHoraExtraJornada = {
  jornadaSemanal: number;
  divisor: number;
  horaNormal: number;
  linhas: { quantidade: number; adicional: number; valorHora: number; total: number }[];
  totalHorasExtras: number;
  dsr: number;
  total: number;
  regraDivisor: RegraResolvida<DivisorValor>;
};

export type ResultadoHoraExtra = ResultadoHoraExtraJornada & {
  regraJornada: RegraResolvida<JornadaValor>;
  /** Same salary and hours under the next legal working week, when a change is scheduled. */
  comparativo?: ResultadoHoraExtraJornada & { aPartirDe: IsoDate };
};

function validar(entrada: EntradaHoraExtra) {
  if (!(entrada.salarioBruto >= 0)) throw new Error('Salary must be a non-negative number');
  for (const { quantidade, adicional } of entrada.horasExtras) {
    if (!(quantidade >= 0)) throw new Error('Overtime hours must be non-negative');
    if (!(adicional >= ADICIONAL_MINIMO)) throw new Error('The overtime premium cannot be below 50%');
  }
  if (entrada.dsr) {
    const { diasUteis, diasDeDescanso } = entrada.dsr;
    if (!Number.isInteger(diasUteis) || diasUteis <= 0 || !Number.isInteger(diasDeDescanso) || diasDeDescanso < 0) {
      throw new Error('DSR days must be whole numbers, with at least one working day');
    }
  }
}

/** The divisor version that starts with the given working-week version (both files switch on the same dates). */
function divisorDaJornada(jornada: Versao<JornadaValor>, hoje: IsoDate) {
  return resolverRegra(regras.divisor, jornada.vigenteDesde, hoje);
}

function calcularParaJornada(
  entrada: EntradaHoraExtra,
  jornada: Versao<JornadaValor>,
  hoje: IsoDate,
): ResultadoHoraExtraJornada {
  const regraDivisor = divisorDaJornada(jornada, hoje);
  const { divisor } = regraDivisor.valor;
  // CLT art. 64: hourly wage = monthly salary ÷ divisor. Kept exact; only amounts are rounded.
  const horaNormalExata = entrada.salarioBruto / divisor;

  const linhas = entrada.horasExtras.map(({ quantidade, adicional }) => {
    const valorHoraExato = horaNormalExata * (1 + adicional);
    return { quantidade, adicional, valorHora: arredondar(valorHoraExato), total: arredondar(valorHoraExato * quantidade) };
  });
  const totalHorasExtras = arredondar(linhas.reduce((soma, l) => soma + l.total, 0));

  // Lei 605/1949 art. 7º + Súmula TST 172: habitual overtime also pays the weekly rest days.
  const dsr = entrada.dsr
    ? arredondar((totalHorasExtras / entrada.dsr.diasUteis) * entrada.dsr.diasDeDescanso)
    : 0;

  return {
    jornadaSemanal: jornada.valor.horas,
    divisor,
    horaNormal: arredondar(horaNormalExata),
    linhas,
    totalHorasExtras,
    dsr,
    total: arredondar(totalHorasExtras + dsr),
    regraDivisor,
  };
}

/**
 * Overtime pay for a monthly-paid CLT employee.
 * @param data reference date (legal working week in force)
 * @param hoje today's date, used only to check how fresh the rules are
 */
export function calcularHoraExtra(entrada: EntradaHoraExtra, data: IsoDate, hoje: IsoDate = data): ResultadoHoraExtra {
  validar(entrada);
  const regraJornada = resolverRegra(regras.jornada, data, hoje);

  let jornada = regraJornada.versao;
  if (entrada.jornadaSemanal !== undefined) {
    const escolhida = regras.jornada.versoes.find((v) => v.valor.horas === entrada.jornadaSemanal);
    if (!escolhida) throw new Error(`Unsupported weekly hours: ${entrada.jornadaSemanal}`);
    jornada = escolhida;
  }

  const resultado = calcularParaJornada(entrada, jornada, hoje);
  const proxima = regras.jornada.versoes
    .filter((v) => v.vigenteDesde > jornada.vigenteDesde)
    .sort((a, b) => a.vigenteDesde.localeCompare(b.vigenteDesde))[0];

  return {
    ...resultado,
    regraJornada,
    comparativo: proxima ? { ...calcularParaJornada(entrada, proxima, hoje), aPartirDe: proxima.vigenteDesde } : undefined,
  };
}
