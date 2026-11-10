import { describe, expect, it } from 'vitest';
import { regras } from '@/lib/regras/catalogo';
import { resolverRegra } from '@/lib/regras/resolver';
import { calcularIrrf } from './irrf';

const tabela = resolverRegra(regras.irrf, '2026-10-28').valor;

describe('calcularIrrf — official Receita Federal examples (Lei 15.270/2025)', () => {
  it('Example 1: R$ 3.036,00 → zero rate bracket', () => {
    const r = calcularIrrf({ rendimentoTributavel: 3036, inss: 257.73, dependentes: 0 }, tabela);
    expect(r).toMatchObject({ metodo: 'simplificado', base: 2428.8, impostoTabela: 0, imposto: 0 });
  });

  it('Example 2: R$ 4.000,00 → R$ 114,76 fully reduced', () => {
    const r = calcularIrrf({ rendimentoTributavel: 4000, inss: 373.41, dependentes: 0 }, tabela);
    expect(r).toMatchObject({ metodo: 'simplificado', base: 3392.8, impostoTabela: 114.76, reducao: 114.76, imposto: 0 });
    expect(r.isentoPelaReducao).toBe(true);
  });

  it('Example 3: R$ 5.000,00 → R$ 312,89 fully reduced', () => {
    const r = calcularIrrf({ rendimentoTributavel: 5000, inss: 509.6, dependentes: 0 }, tabela);
    expect(r).toMatchObject({ base: 4392.8, impostoTabela: 312.89, reducao: 312.89, imposto: 0 });
  });

  it('Example 4: R$ 6.000,00 → legal deductions, reduction on the salary, R$ 382,88', () => {
    const r = calcularIrrf({ rendimentoTributavel: 6000, inss: 649.6, dependentes: 0 }, tabela);
    expect(r).toMatchObject({ metodo: 'legal', base: 5350.4, impostoTabela: 562.63, reducao: 179.75, imposto: 382.88 });
  });

  it('Example 5: R$ 7.607,20 → no reduction, R$ 1.016,27', () => {
    const r = calcularIrrf({ rendimentoTributavel: 7607.2, inss: 0, dependentes: 0 }, tabela);
    expect(r).toMatchObject({ metodo: 'simplificado', base: 7000, impostoTabela: 1016.27, reducao: 0, imposto: 1016.27 });
  });
});

describe('calcularIrrf — other rules', () => {
  it('uses dependents in the legal deductions when that lowers the tax', () => {
    const r = calcularIrrf({ rendimentoTributavel: 8000, inss: 921.51, dependentes: 2 }, tabela);
    expect(r).toMatchObject({ metodo: 'legal', deducoes: 1300.69, base: 6699.31, imposto: 933.58, reducao: 0 });
  });

  it('caps the reduction at the computed tax', () => {
    const r = calcularIrrf({ rendimentoTributavel: 5100, inss: 515.51, dependentes: 4 }, tabela);
    expect(r.impostoTabela).toBe(185.39);
    expect(r.reducao).toBe(185.39);
    expect(r.imposto).toBe(0);
  });

  it('applies the partial reduction between R$ 5.000 and R$ 7.350', () => {
    const r = calcularIrrf({ rendimentoTributavel: 5500, inss: 571.51, dependentes: 3 }, tabela);
    expect(r).toMatchObject({ impostoTabela: 305.45, reducao: 246.32, imposto: 59.13 });
  });

  it('switches exactly at the R$ 5.000 and R$ 7.350 thresholds', () => {
    expect(calcularIrrf({ rendimentoTributavel: 5000.01, inss: 509.6, dependentes: 0 }, tabela).imposto).toBe(0);
    expect(calcularIrrf({ rendimentoTributavel: 7350, inss: 0, dependentes: 0 }, tabela).reducao).toBe(0);
  });

  it('deducts alimony from the tax base', () => {
    const sem = calcularIrrf({ rendimentoTributavel: 9000, inss: 988.09, dependentes: 0 }, tabela);
    const com = calcularIrrf({ rendimentoTributavel: 9000, inss: 988.09, dependentes: 0, pensaoAlimenticia: 1000 }, tabela);
    expect(sem.imposto - com.imposto).toBeCloseTo(275, 2);
  });

  it('rejects invalid input', () => {
    expect(() => calcularIrrf({ rendimentoTributavel: -1, inss: 0, dependentes: 0 }, tabela)).toThrow();
    expect(() => calcularIrrf({ rendimentoTributavel: 1000, inss: 0, dependentes: 1.5 }, tabela)).toThrow();
  });
});
