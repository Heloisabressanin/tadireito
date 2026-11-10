import { describe, expect, it } from 'vitest';
import { regras, todasAsRegras } from './catalogo';
import { resolverRegra } from './resolver';

describe('rule catalogue', () => {
  it('cites at least one official source for every version', () => {
    for (const regra of todasAsRegras) {
      for (const versao of regra.versoes) {
        expect(versao.fontes.length, `${regra.id} ${versao.vigenteDesde}`).toBeGreaterThan(0);
      }
    }
  });

  it('has unique rule ids', () => {
    const ids = todasAsRegras.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('applies the new working week on the dates set by EC 141/2026', () => {
    expect(resolverRegra(regras.jornada, '2026-12-15').valor.horas).toBe(44);
    expect(resolverRegra(regras.jornada, '2026-12-16').valor.horas).toBe(42);
    expect(resolverRegra(regras.jornada, '2027-12-16').valor.horas).toBe(40);
  });

  it('keeps hours and divisor switching on the same days', () => {
    const datas = regras.jornada.versoes.map((v) => v.vigenteDesde);
    expect(regras.divisor.versoes.map((v) => v.vigenteDesde)).toEqual(datas);
  });

  it('marks the post-EC divisors as estimates until official regulation', () => {
    expect(resolverRegra(regras.divisor, '2026-12-16').alertas).toContain('valor-estimado');
    expect(resolverRegra(regras.divisor, '2026-11-01').alertas).not.toContain('valor-estimado');
  });

  it('raises the MEI limit per LC 238/2026', () => {
    expect(resolverRegra(regras.meiLimite, '2026-12-31').valor.anual).toBe(81000);
    expect(resolverRegra(regras.meiLimite, '2027-01-01').valor.anual).toBe(110000);
    expect(resolverRegra(regras.meiLimite, '2028-01-01').valor.anual).toBe(140000);
  });

  it('keeps the MEI monthly amount consistent with the annual limit', () => {
    for (const { valor } of regras.meiLimite.versoes) {
      expect(valor.mensalProporcional).toBeCloseTo(valor.anual / 12, 1);
    }
  });

  it('keeps IRRF brackets continuous (no jump in tax between brackets)', () => {
    const { faixas } = resolverRegra(regras.irrf, '2026-10-28').valor;
    for (let i = 1; i < faixas.length; i++) {
      const limite = faixas[i - 1].ate as number;
      const antes = limite * faixas[i - 1].aliquota - faixas[i - 1].deducao;
      const depois = limite * faixas[i].aliquota - faixas[i].deducao;
      expect(Math.abs(antes - depois), `bracket ${i}`).toBeLessThan(0.02);
    }
  });
});
