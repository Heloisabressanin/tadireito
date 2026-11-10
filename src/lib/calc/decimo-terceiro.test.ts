import { describe, expect, it } from 'vitest';
import { regras } from '@/lib/regras/catalogo';
import { resolverRegra } from '@/lib/regras/resolver';
import { calcularDecimoTerceiro } from './decimo-terceiro';
import { calcularInss } from './inss';
import { calcularIrrf } from './irrf';

const HOJE = '2026-11-10';

describe('calcularDecimoTerceiro', () => {
  it('full year, R$ 3.000: half in November, the rest minus INSS in December, no income tax', () => {
    const r = calcularDecimoTerceiro({ salarioBruto: 3000, meses: 12, dependentes: 0 }, HOJE);
    expect(r.bruto).toBe(3000);
    expect(r.primeiraParcela).toBe(1500);
    // 7,5% × 1.621 + 9% × 1.281,84 + 12% × 97,16 = 248,5998
    expect(r.inss.total).toBe(248.6);
    expect(r.irrf.imposto).toBe(0);
    expect(r.segundaParcela).toBe(1251.4);
    expect(r.liquido).toBe(2751.4);
  });

  it('is proportional to the months worked and includes the average of variable pay', () => {
    const r = calcularDecimoTerceiro({ salarioBruto: 3000, mediaVariaveis: 300, meses: 7, dependentes: 0 }, HOJE);
    expect(r.base).toBe(3300);
    expect(r.bruto).toBe(1925);
    expect(r.primeiraParcela).toBe(962.5);
  });

  it('computes INSS and income tax on the 13º alone, like a separate month', () => {
    const r = calcularDecimoTerceiro({ salarioBruto: 6000, meses: 12, dependentes: 1 }, HOJE);
    const inss = calcularInss(6000, resolverRegra(regras.inss, HOJE).valor);
    const irrf = calcularIrrf({ rendimentoTributavel: 6000, inss: inss.total, dependentes: 1 }, resolverRegra(regras.irrf, HOJE).valor);
    expect(r.inss.total).toBe(inss.total);
    expect(r.irrf.imposto).toBe(irrf.imposto);
    expect(r.segundaParcela).toBe(Math.round((6000 - 3000 - inss.total - irrf.imposto) * 100) / 100);
  });

  it('applies the Lei 15.270 reduction to the 13º: zero tax up to R$ 5.000 (Lei 9.250, art. 3º-A, § 3º)', () => {
    const r = calcularDecimoTerceiro({ salarioBruto: 5000, meses: 12, dependentes: 0 }, HOJE);
    expect(r.irrf.impostoTabela).toBeGreaterThan(0);
    expect(r.irrf.imposto).toBe(0);
    expect(r.irrf.isentoPelaReducao).toBe(true);
  });

  it('applies the partial reduction between R$ 5.000 and R$ 7.350', () => {
    const r = calcularDecimoTerceiro({ salarioBruto: 6000, meses: 12, dependentes: 0 }, HOJE);
    expect(r.irrf.reducao).toBe(179.75);
  });

  it('flags the simplified-discount reading only when it is the method that lowered the tax', () => {
    const ids = (r: ReturnType<typeof calcularDecimoTerceiro>) => r.regras.map((x) => x.id);
    // R$ 5.500: INSS (571,51) < R$ 607,20, so the simplified discount wins and tax remains after the reduction.
    const simplificado = calcularDecimoTerceiro({ salarioBruto: 5500, meses: 12, dependentes: 0 }, HOJE);
    expect(simplificado.irrf).toMatchObject({ metodo: 'simplificado', impostoTabela: 436.79, reducao: 246.32, imposto: 190.47 });
    expect(ids(simplificado)).toContain('decimo-terceiro.irrf');
    // Tax is zero anyway: the reading does not change the result, so no warning.
    expect(ids(calcularDecimoTerceiro({ salarioBruto: 3000, meses: 12, dependentes: 0 }, HOJE))).not.toContain('decimo-terceiro.irrf');
    // Legal deductions win: no warning either.
    const legal = calcularDecimoTerceiro({ salarioBruto: 9000, meses: 12, dependentes: 0 }, HOJE);
    expect(legal.irrf.metodo).toBe('legal');
    expect(ids(legal)).not.toContain('decimo-terceiro.irrf');
  });

  it('gives the legal deadlines and moves a weekend deadline to the Friday before', () => {
    const r2026 = calcularDecimoTerceiro({ salarioBruto: 3000, meses: 12, dependentes: 0 }, HOJE);
    expect(r2026.prazos.primeira).toEqual({ data: '2026-11-30' }); // Monday
    expect(r2026.prazos.segunda).toEqual({ data: '2026-12-20', antecipadoPara: '2026-12-18' }); // Sunday → Friday
    const r2027 = calcularDecimoTerceiro({ salarioBruto: 3000, meses: 12, dependentes: 0 }, '2027-11-10', '2026-11-10');
    expect(r2027.prazos.segunda).toEqual({ data: '2027-12-20' }); // Monday
  });

  it('rejects invalid months', () => {
    expect(() => calcularDecimoTerceiro({ salarioBruto: 3000, meses: 0, dependentes: 0 }, HOJE)).toThrow();
    expect(() => calcularDecimoTerceiro({ salarioBruto: 3000, meses: 13, dependentes: 0 }, HOJE)).toThrow();
    expect(() => calcularDecimoTerceiro({ salarioBruto: 3000, meses: 6.5, dependentes: 0 }, HOJE)).toThrow();
  });
});
