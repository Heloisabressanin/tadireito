import { describe, expect, it } from 'vitest';
import { regras } from '@/lib/regras/catalogo';
import { resolverRegra } from '@/lib/regras/resolver';
import { calcularInss } from './inss';

const tabela2026 = resolverRegra(regras.inss, '2026-10-28').valor;

// Test fixture only: the 2025 table used in the Receita Federal's official Lei 15.270 examples.
const tabela2025 = {
  faixas: [
    { ate: 1518.0, aliquota: 0.075 },
    { ate: 2793.88, aliquota: 0.09 },
    { ate: 4190.83, aliquota: 0.12 },
    { ate: 8157.41, aliquota: 0.14 },
  ],
};

describe('calcularInss', () => {
  it('reproduces the INSS amounts of the Receita Federal examples (2025 table)', () => {
    expect(calcularInss(3036, tabela2025).total).toBe(257.73);
    expect(calcularInss(4000, tabela2025).total).toBe(373.41);
    expect(calcularInss(5000, tabela2025).total).toBe(509.6);
    expect(calcularInss(6000, tabela2025).total).toBe(649.6);
  });

  it('computes the 2026 contribution progressively', () => {
    expect(calcularInss(1621, tabela2026).total).toBe(121.58);
    const resultado = calcularInss(3500, tabela2026);
    expect(resultado.total).toBe(308.6);
    expect(resultado.faixas.map((f) => f.aliquota)).toEqual([0.075, 0.09, 0.12]);
    expect(resultado.faixas.reduce((soma, f) => soma + f.valor, 0)).toBeCloseTo(308.6, 10);
  });

  it('stops at the ceiling', () => {
    const noTeto = calcularInss(8475.55, tabela2026);
    const acima = calcularInss(20000, tabela2026);
    expect(noTeto.total).toBe(988.09);
    expect(acima.total).toBe(988.09);
    expect(acima.tetoAtingido).toBe(true);
    expect(noTeto.tetoAtingido).toBe(false);
  });

  it('returns zero for a zero salary and rejects invalid input', () => {
    expect(calcularInss(0, tabela2026)).toMatchObject({ total: 0, faixas: [] });
    expect(() => calcularInss(-1, tabela2026)).toThrow();
    expect(() => calcularInss(Number.NaN, tabela2026)).toThrow();
  });
});
