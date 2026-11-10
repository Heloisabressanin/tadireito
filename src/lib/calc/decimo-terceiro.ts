import { regras } from '@/lib/regras/catalogo';
import type { IsoDate } from '@/lib/regras/dates';
import { resolverRegra, type RegraResolvida } from '@/lib/regras/resolver';
import { arredondar } from './dinheiro';
import { calcularInss, type ResultadoInss } from './inss';
import { calcularIrrf, type ResultadoIrrf } from './irrf';

export type EntradaDecimoTerceiro = {
  /** December salary (or current salary). */
  salarioBruto: number;
  /** Monthly average of variable pay (overtime, commissions, night shift…). */
  mediaVariaveis?: number;
  /** Months worked in the year: a month with 15 days or more counts as a full month (Lei 4.090/1962, art. 1º, § 2º). */
  meses: number;
  dependentes: number;
};

export type Prazo = {
  /** Legal deadline. */
  data: IsoDate;
  /** Last business day on or before the deadline, when the deadline falls on a weekend. */
  antecipadoPara?: IsoDate;
};

export type ResultadoDecimoTerceiro = {
  base: number;
  meses: number;
  bruto: number;
  primeiraParcela: number;
  inss: ResultadoInss;
  irrf: ResultadoIrrf;
  segundaParcela: number;
  liquido: number;
  prazos: { primeira: Prazo; segunda: Prazo };
  regras: RegraResolvida<unknown>[];
};

/** Moves a weekend date back to the previous Friday. */
function prazo(data: IsoDate): Prazo {
  const dia = new Date(`${data}T12:00:00Z`).getUTCDay(); // 0 = Sunday, 6 = Saturday
  if (dia !== 0 && dia !== 6) return { data };
  const recuo = dia === 0 ? 2 : 1;
  const antes = new Date(Date.parse(`${data}T12:00:00Z`) - recuo * 86_400_000).toISOString().slice(0, 10);
  return { data, antecipadoPara: antes };
}

/**
 * 13º salário (gratificação natalina) for a CLT employee.
 * 1st installment (until 30/11): half, with no deduction. 2nd (until 20/12): the rest, minus INSS and income tax,
 * both computed on the full 13º and separately from the monthly salary.
 */
export function calcularDecimoTerceiro(entrada: EntradaDecimoTerceiro, data: IsoDate, hoje: IsoDate = data): ResultadoDecimoTerceiro {
  const { salarioBruto, mediaVariaveis = 0, meses, dependentes } = entrada;
  if (!(salarioBruto >= 0) || !(mediaVariaveis >= 0)) throw new Error('Amounts must be non-negative numbers');
  if (!Number.isInteger(meses) || meses < 1 || meses > 12) throw new Error('Months must be an integer from 1 to 12');

  const regraInss = resolverRegra(regras.inss, data, hoje);
  const regraIrrf = resolverRegra(regras.irrf, data, hoje);
  const regraPrazos = resolverRegra(regras.decimoTerceiroPrazos, data, hoje);
  const regra13Irrf = resolverRegra(regras.decimoTerceiroIrrf, data, hoje);

  const base = arredondar(salarioBruto + mediaVariaveis);
  const bruto = arredondar((base * meses) / 12);
  const primeiraParcela = arredondar(bruto / 2);

  const inss = calcularInss(bruto, regraInss.valor);
  const tabelaIrrf = regra13Irrf.valor.descontoSimplificado ? regraIrrf.valor : { ...regraIrrf.valor, descontoSimplificado: 0 };
  // Lei 9.250, art. 3º-A, § 3º: the Lei 15.270 reduction also applies to the 13º, on the 13º amount itself.
  const irrf = calcularIrrf({ rendimentoTributavel: bruto, inss: inss.total, dependentes }, tabelaIrrf);

  const segundaParcela = arredondar(bruto - primeiraParcela - inss.total - irrf.imposto);
  const ano = data.slice(0, 4);

  return {
    base,
    meses,
    bruto,
    primeiraParcela,
    inss,
    irrf,
    segundaParcela,
    liquido: arredondar(bruto - inss.total - irrf.imposto),
    prazos: {
      primeira: prazo(`${ano}-${regraPrazos.valor.primeiraParcelaAte}`),
      segunda: prazo(`${ano}-${regraPrazos.valor.segundaParcelaAte}`),
    },
    // The simplified-discount reading only matters (and is only flagged) when it is the method used.
    regras: [regraInss, regraIrrf, regraPrazos, ...(irrf.metodo === 'simplificado' && irrf.imposto > 0 ? [regra13Irrf] : [])],
  };
}
