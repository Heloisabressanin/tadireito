import type { IrrfValor } from '@/lib/regras/catalogo';
import { arredondar } from './dinheiro';

export type EntradaIrrf = {
  /** Monthly taxable income (gross salary). The Lei 15.270 reduction is based on this, not on the tax base. */
  rendimentoTributavel: number;
  inss: number;
  dependentes: number;
  pensaoAlimenticia?: number;
};

export type ResultadoIrrf = {
  /** Which deduction gave the lower tax: legal deductions or the simplified monthly discount. */
  metodo: 'legal' | 'simplificado';
  deducoes: number;
  base: number;
  aliquota: number;
  parcelaADeduzir: number;
  /** Tax from the progressive table, before the Lei 15.270 reduction. */
  impostoTabela: number;
  reducao: number;
  imposto: number;
  /** True when the reduction brought the tax to zero (income up to R$ 5,000). */
  isentoPelaReducao: boolean;
};

function impostoDaTabela(base: number, tabela: IrrfValor) {
  const faixa = tabela.faixas.find((f) => f.ate === null || base <= f.ate) ?? tabela.faixas[tabela.faixas.length - 1];
  return {
    aliquota: faixa.aliquota,
    parcelaADeduzir: faixa.deducao,
    imposto: Math.max(0, arredondar(base * faixa.aliquota - faixa.deducao)),
  };
}

/** Lei 9.250, art. 3º-A (added by Lei 15.270/2025), capped at the computed tax (§1º). */
function reducaoLei15270(rendimento: number, impostoTabela: number, tabela: IrrfValor) {
  const { isencaoAte, faixaAte, constante, coeficiente } = tabela.reducao;
  if (rendimento <= isencaoAte) return impostoTabela;
  if (rendimento > faixaAte) return 0;
  const reducao = Math.max(0, arredondar(constante - coeficiente * rendimento));
  return Math.min(reducao, impostoTabela);
}

export function calcularIrrf(entrada: EntradaIrrf, tabela: IrrfValor): ResultadoIrrf {
  const { rendimentoTributavel: rendimento, inss, dependentes, pensaoAlimenticia = 0 } = entrada;
  if (!(rendimento >= 0) || !(inss >= 0) || !(pensaoAlimenticia >= 0)) {
    throw new Error('Amounts must be non-negative numbers');
  }
  if (!Number.isInteger(dependentes) || dependentes < 0) {
    throw new Error('Dependents must be a non-negative integer');
  }

  const deducoesLegais = arredondar(inss + dependentes * tabela.deducaoPorDependente + pensaoAlimenticia);
  const opcoes = (
    [
      ['legal', deducoesLegais],
      ['simplificado', tabela.descontoSimplificado],
    ] as const
  ).map(([metodo, deducoes]) => {
    const base = Math.max(0, arredondar(rendimento - deducoes));
    return { metodo, deducoes, base, ...impostoDaTabela(base, tabela) };
  });

  // Lei 9.250, art. 4º, §2º: the simplified discount applies only "caso seja mais benéfico".
  const escolhida = opcoes[1].imposto < opcoes[0].imposto ? opcoes[1] : opcoes[0];
  const reducao = reducaoLei15270(rendimento, escolhida.imposto, tabela);
  const imposto = arredondar(escolhida.imposto - reducao);

  return {
    metodo: escolhida.metodo,
    deducoes: escolhida.deducoes,
    base: escolhida.base,
    aliquota: escolhida.aliquota,
    parcelaADeduzir: escolhida.parcelaADeduzir,
    impostoTabela: escolhida.imposto,
    reducao,
    imposto,
    isentoPelaReducao: escolhida.imposto > 0 && imposto === 0,
  };
}
