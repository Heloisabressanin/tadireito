import { regras } from '@/lib/regras/catalogo';
import type { IsoDate } from '@/lib/regras/dates';
import { resolverRegra, type RegraResolvida } from '@/lib/regras/resolver';
import { arredondar } from './dinheiro';
import { calcularInss, type ResultadoInss } from './inss';
import { calcularIrrf, type ResultadoIrrf } from './irrf';

export type EntradaSalarioLiquido = {
  salarioBruto: number;
  dependentes: number;
  /** Court-ordered alimony: deductible from the income tax base. */
  pensaoAlimenticia?: number;
  /** Other payroll deductions (transport voucher, health plan…): not deductible from the tax base. */
  outrosDescontos?: number;
};

export type ResultadoSalarioLiquido = {
  salarioBruto: number;
  inss: ResultadoInss;
  irrf: ResultadoIrrf;
  pensaoAlimenticia: number;
  outrosDescontos: number;
  totalDescontos: number;
  salarioLiquido: number;
  /** Share of the gross salary taken by INSS + IRRF. */
  aliquotaEfetiva: number;
  /** Rules used, with sources and alerts, to show next to the result. */
  regras: RegraResolvida<unknown>[];
};

/**
 * Net monthly salary for a CLT employee.
 * @param data reference month (rules in force on this date)
 * @param hoje today's date, used only to check how fresh the rules are
 */
export function calcularSalarioLiquido(
  entrada: EntradaSalarioLiquido,
  data: IsoDate,
  hoje: IsoDate = data,
): ResultadoSalarioLiquido {
  const { salarioBruto, dependentes, pensaoAlimenticia = 0, outrosDescontos = 0 } = entrada;
  if (!(outrosDescontos >= 0)) throw new Error('Other deductions must be a non-negative number');

  const regraInss = resolverRegra(regras.inss, data, hoje);
  const regraIrrf = resolverRegra(regras.irrf, data, hoje);

  const inss = calcularInss(salarioBruto, regraInss.valor);
  const irrf = calcularIrrf(
    { rendimentoTributavel: salarioBruto, inss: inss.total, dependentes, pensaoAlimenticia },
    regraIrrf.valor,
  );

  const totalDescontos = arredondar(inss.total + irrf.imposto + pensaoAlimenticia + outrosDescontos);

  return {
    salarioBruto,
    inss,
    irrf,
    pensaoAlimenticia,
    outrosDescontos,
    totalDescontos,
    salarioLiquido: arredondar(salarioBruto - totalDescontos),
    aliquotaEfetiva: salarioBruto > 0 ? (inss.total + irrf.imposto) / salarioBruto : 0,
    regras: [regraInss, regraIrrf],
  };
}
