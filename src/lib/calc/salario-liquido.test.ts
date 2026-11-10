import { describe, expect, it } from 'vitest';
import { calcularSalarioLiquido } from './salario-liquido';

describe('calcularSalarioLiquido', () => {
  it('R$ 3.500 in 2026 → R$ 3.191,40, no income tax thanks to Lei 15.270', () => {
    const r = calcularSalarioLiquido({ salarioBruto: 3500, dependentes: 0 }, '2026-10-28');
    expect(r.inss.total).toBe(308.6);
    expect(r.irrf.imposto).toBe(0);
    expect(r.irrf.isentoPelaReducao).toBe(true);
    expect(r.salarioLiquido).toBe(3191.4);
  });

  it('R$ 8.000 with 2 dependents', () => {
    const r = calcularSalarioLiquido({ salarioBruto: 8000, dependentes: 2 }, '2026-10-28');
    expect(r.inss.total).toBe(921.51);
    expect(r.irrf.imposto).toBe(933.58);
    expect(r.salarioLiquido).toBe(6144.91);
    expect(r.aliquotaEfetiva).toBeCloseTo((921.51 + 933.58) / 8000, 10);
  });

  it('subtracts alimony and other deductions from the net salary', () => {
    const r = calcularSalarioLiquido(
      { salarioBruto: 3500, dependentes: 0, pensaoAlimenticia: 500, outrosDescontos: 210 },
      '2026-10-28',
    );
    expect(r.salarioLiquido).toBe(arredondarEsperado(3500 - 308.6 - 500 - 210 - r.irrf.imposto));
  });

  it('returns the rules used, with sources, and warns once the 2026 INSS table expires', () => {
    const atual = calcularSalarioLiquido({ salarioBruto: 3500, dependentes: 0 }, '2026-10-28');
    expect(atual.regras.map((r) => r.id)).toEqual(['inss.empregado', 'irrf.mensal']);
    expect(atual.regras.every((r) => r.alertas.length === 0)).toBe(true);

    const janeiro = calcularSalarioLiquido({ salarioBruto: 3500, dependentes: 0 }, '2027-01-05', '2027-01-05');
    expect(janeiro.regras[0].alertas).toContain('sem-versao-vigente');
  });
});

function arredondarEsperado(valor: number) {
  return Math.round(valor * 100) / 100;
}
