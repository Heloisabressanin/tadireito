import { regras, type MeiLimiteValor } from '@/lib/regras/catalogo';
import type { IsoDate } from '@/lib/regras/dates';
import { resolverRegra, type RegraResolvida } from '@/lib/regras/resolver';
import { arredondar } from './dinheiro';

/**
 * LC 123/2006, art. 18-A, §7º:
 * - up to 20% above the limit: leaves the MEI regime from 1 January of the next year, paying the difference;
 * - more than 20% above: leaves retroactively from 1 January (or from the opening date).
 */
export type SituacaoMei = 'dentro-do-limite' | 'excesso-ate-20' | 'excesso-acima-de-20';

export type EntradaLimiteMei = {
  ano: number;
  /** Month the business opened, "YYYY-MM". Omit if it opened before `ano`. */
  inicioAtividade?: string;
  /** Revenue already billed in `ano`. */
  faturado: number;
  /** Last month (1-12) included in `faturado`, to project the year. Omit to skip the projection. */
  ateMes?: number;
};

export type ResultadoLimiteMei = {
  ano: number;
  limite: number;
  /** The limit is prorated when the business opened during `ano`. */
  proporcional: boolean;
  mesesNoAno: number;
  limiteComTolerancia: number;
  percentualUsado: number;
  restante: number;
  situacao: SituacaoMei;
  projecao?: {
    mediaMensal: number;
    totalNoAno: number;
    situacao: SituacaoMei;
    /** Month (1-12) in which the limit would be exceeded at the current pace. */
    mesDeEstouro?: number;
  };
  regra: RegraResolvida<MeiLimiteValor>;
};

function situacaoPara(valor: number, limite: number, tolerancia: number): SituacaoMei {
  if (valor <= limite) return 'dentro-do-limite';
  if (valor <= arredondar(limite * (1 + tolerancia))) return 'excesso-ate-20';
  return 'excesso-acima-de-20';
}

export function calcularLimiteMei(entrada: EntradaLimiteMei, hoje: IsoDate): ResultadoLimiteMei {
  const { ano, inicioAtividade, faturado, ateMes } = entrada;
  if (!Number.isInteger(ano) || ano < 2018) throw new Error('Year must be 2018 or later');
  if (!(faturado >= 0)) throw new Error('Revenue must be a non-negative number');

  let mesInicial = 1;
  if (inicioAtividade !== undefined) {
    const match = /^(\d{4})-(\d{2})$/.exec(inicioAtividade);
    const anoInicio = match ? Number(match[1]) : NaN;
    const mesInicio = match ? Number(match[2]) : NaN;
    if (!match || mesInicio < 1 || mesInicio > 12) throw new Error('inicioAtividade must be YYYY-MM');
    if (anoInicio > ano) throw new Error('The business cannot open after the chosen year');
    if (anoInicio === ano) mesInicial = mesInicio;
  }
  if (ateMes !== undefined && (!Number.isInteger(ateMes) || ateMes < mesInicial || ateMes > 12)) {
    throw new Error('ateMes must be a month between the opening month and December');
  }

  const regra = resolverRegra(regras.meiLimite, `${ano}-01-01`, hoje);
  const { anual, mensalProporcional, toleranciaExcesso } = regra.valor;

  // §2º: fractions of a month count as a whole month, so the opening month counts fully.
  const mesesNoAno = 13 - mesInicial;
  const proporcional = mesInicial > 1;
  const limite = proporcional ? arredondar(mensalProporcional * mesesNoAno) : anual;

  let projecao: ResultadoLimiteMei['projecao'];
  if (ateMes !== undefined) {
    const mesesDecorridos = ateMes - mesInicial + 1;
    const mediaMensal = faturado / mesesDecorridos;
    const totalNoAno = arredondar(mediaMensal * mesesNoAno);
    const mesesAteEstouro = mediaMensal > 0 ? Math.floor(limite / mediaMensal) + 1 : Infinity;
    const mesDeEstouro = mesInicial + mesesAteEstouro - 1;
    projecao = {
      mediaMensal: arredondar(mediaMensal),
      totalNoAno,
      situacao: situacaoPara(totalNoAno, limite, toleranciaExcesso),
      mesDeEstouro: totalNoAno > limite && mesDeEstouro <= 12 ? mesDeEstouro : undefined,
    };
  }

  return {
    ano,
    limite,
    proporcional,
    mesesNoAno,
    limiteComTolerancia: arredondar(limite * (1 + toleranciaExcesso)),
    percentualUsado: limite > 0 ? faturado / limite : 0,
    restante: arredondar(Math.max(0, limite - faturado)),
    situacao: situacaoPara(faturado, limite, toleranciaExcesso),
    projecao,
    regra,
  };
}
