import type { InssValor } from '@/lib/regras/catalogo';
import { arredondar, distribuirArredondamento } from './dinheiro';

export type FaixaInssCalculada = {
  de: number;
  ate: number;
  aliquota: number;
  /** Part of the salary that falls in this bracket. */
  base: number;
  valor: number;
};

export type ResultadoInss = {
  total: number;
  /** Only the brackets reached by the salary. */
  faixas: FaixaInssCalculada[];
  /** True when the salary is above the ceiling (the contribution stops growing). */
  tetoAtingido: boolean;
  teto: number;
};

/** Progressive INSS: each slice of the salary pays its own rate, up to the ceiling. */
export function calcularInss(salario: number, tabela: InssValor): ResultadoInss {
  if (!(salario >= 0)) throw new Error('Salary must be a non-negative number');

  const teto = tabela.faixas[tabela.faixas.length - 1].ate;
  const exatas: Omit<FaixaInssCalculada, 'valor'>[] = [];
  const valoresExatos: number[] = [];
  let inicio = 0;

  for (const faixa of tabela.faixas) {
    if (salario <= inicio) break;
    const base = Math.min(salario, faixa.ate) - inicio;
    exatas.push({ de: inicio, ate: faixa.ate, aliquota: faixa.aliquota, base: arredondar(base) });
    valoresExatos.push(base * faixa.aliquota);
    inicio = faixa.ate;
  }

  // The official examples round the sum of the exact slices, not each slice.
  const total = arredondar(valoresExatos.reduce((soma, v) => soma + v, 0));
  const valores = distribuirArredondamento(valoresExatos, total);

  return {
    total,
    faixas: exatas.map((faixa, i) => ({ ...faixa, valor: valores[i] })),
    tetoAtingido: salario > teto,
    teto,
  };
}
