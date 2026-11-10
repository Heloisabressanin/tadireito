import { describe, expect, it } from 'vitest';
import { calcularHoraExtra } from './hora-extra';

const base = { salarioBruto: 2400, horasExtras: [{ quantidade: 10, adicional: 0.5 }] };

describe('calcularHoraExtra', () => {
  it('uses the 220 divisor while the week is 44 hours', () => {
    const r = calcularHoraExtra(base, '2026-10-28');
    expect(r).toMatchObject({ jornadaSemanal: 44, divisor: 220, horaNormal: 10.91, totalHorasExtras: 163.64, dsr: 0, total: 163.64 });
    expect(r.linhas[0].valorHora).toBe(16.36);
    expect(r.regraDivisor.alertas).toEqual([]);
  });

  it('compares with the 42-hour week starting on 16/12/2026', () => {
    const { comparativo } = calcularHoraExtra(base, '2026-10-28');
    expect(comparativo).toMatchObject({ aPartirDe: '2026-12-16', jornadaSemanal: 42, divisor: 210, horaNormal: 11.43, total: 171.43 });
    expect(comparativo?.linhas[0].valorHora).toBe(17.14);
    expect(comparativo?.regraDivisor.alertas).toContain('valor-estimado');
  });

  it('switches automatically on 16/12/2026 and then compares with 40 hours', () => {
    const r = calcularHoraExtra(base, '2026-12-16');
    expect(r.jornadaSemanal).toBe(42);
    expect(r.regraDivisor.alertas).toContain('valor-estimado');
    expect(r.comparativo).toMatchObject({ aPartirDe: '2027-12-16', jornadaSemanal: 40, divisor: 200, total: 180 });
  });

  it('has nothing to compare once the 40-hour week is in force', () => {
    expect(calcularHoraExtra(base, '2028-01-10').comparativo).toBeUndefined();
  });

  it('lets the user choose a contractual working week', () => {
    const r = calcularHoraExtra({ ...base, jornadaSemanal: 44 }, '2026-12-20');
    expect(r.divisor).toBe(220);
    expect(r.comparativo?.jornadaSemanal).toBe(42);
    expect(() => calcularHoraExtra({ ...base, jornadaSemanal: 45 }, '2026-10-28')).toThrow();
  });

  it('adds 100% overtime and the weekly rest (DSR)', () => {
    const r = calcularHoraExtra(
      { salarioBruto: 2400, horasExtras: [{ quantidade: 10, adicional: 0.5 }, { quantidade: 2, adicional: 1 }], dsr: { diasUteis: 25, diasDeDescanso: 5 } },
      '2026-10-28',
    );
    expect(r.linhas[1]).toMatchObject({ valorHora: 21.82, total: 43.64 });
    expect(r.totalHorasExtras).toBe(207.28);
    expect(r.dsr).toBe(41.46);
    expect(r.total).toBe(248.74);
  });

  it('refuses a premium below the constitutional 50% and invalid DSR days', () => {
    expect(() => calcularHoraExtra({ salarioBruto: 2400, horasExtras: [{ quantidade: 1, adicional: 0.4 }] }, '2026-10-28')).toThrow(/50%/);
    expect(() => calcularHoraExtra({ ...base, dsr: { diasUteis: 0, diasDeDescanso: 4 } }, '2026-10-28')).toThrow();
  });
});
