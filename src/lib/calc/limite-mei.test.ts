import { describe, expect, it } from 'vitest';
import { calcularLimiteMei } from './limite-mei';

const hoje = '2026-10-28';

describe('calcularLimiteMei', () => {
  it('2026: R$ 58.300 billed by October uses 72% and stays within the limit', () => {
    const r = calcularLimiteMei({ ano: 2026, faturado: 58300, ateMes: 10 }, hoje);
    expect(r).toMatchObject({ limite: 81000, proporcional: false, restante: 22700, situacao: 'dentro-do-limite' });
    expect(r.percentualUsado).toBeCloseTo(0.7198, 4);
    expect(r.projecao).toMatchObject({ mediaMensal: 5830, totalNoAno: 69960, situacao: 'dentro-do-limite' });
    expect(r.projecao?.mesDeEstouro).toBeUndefined();
  });

  it('applies the LC 238/2026 limits in 2027 and 2028', () => {
    expect(calcularLimiteMei({ ano: 2027, faturado: 0 }, hoje)).toMatchObject({ limite: 110000, limiteComTolerancia: 132000 });
    expect(calcularLimiteMei({ ano: 2028, faturado: 0 }, hoje).limite).toBe(140000);
  });

  it('prorates the limit when the business opens during the year, counting the opening month', () => {
    expect(calcularLimiteMei({ ano: 2026, inicioAtividade: '2026-07', faturado: 0 }, hoje)).toMatchObject({ limite: 40500, proporcional: true, mesesNoAno: 6 });
    expect(calcularLimiteMei({ ano: 2027, inicioAtividade: '2027-03', faturado: 0 }, hoje).limite).toBe(91666.7);
    // Opened in an earlier year: full limit.
    expect(calcularLimiteMei({ ano: 2027, inicioAtividade: '2024-05', faturado: 0 }, hoje).proporcional).toBe(false);
  });

  it('distinguishes an excess up to 20% from a larger one', () => {
    expect(calcularLimiteMei({ ano: 2026, faturado: 97200 }, hoje).situacao).toBe('excesso-ate-20');
    expect(calcularLimiteMei({ ano: 2026, faturado: 97200.01 }, hoje).situacao).toBe('excesso-acima-de-20');
    expect(calcularLimiteMei({ ano: 2026, faturado: 81000 }, hoje).situacao).toBe('dentro-do-limite');
  });

  it('projects the month the limit would be exceeded', () => {
    const r = calcularLimiteMei({ ano: 2026, faturado: 60000, ateMes: 6 }, hoje);
    expect(r.projecao).toMatchObject({ mediaMensal: 10000, totalNoAno: 120000, situacao: 'excesso-acima-de-20', mesDeEstouro: 9 });
  });

  it('projects from the opening month for a new business', () => {
    const r = calcularLimiteMei({ ano: 2026, inicioAtividade: '2026-07', faturado: 24000, ateMes: 10 }, hoje);
    expect(r.projecao).toMatchObject({ mediaMensal: 6000, totalNoAno: 36000, situacao: 'dentro-do-limite' });
  });

  it('rejects inconsistent input', () => {
    expect(() => calcularLimiteMei({ ano: 2026, inicioAtividade: '2027-01', faturado: 0 }, hoje)).toThrow();
    expect(() => calcularLimiteMei({ ano: 2026, inicioAtividade: '2026-07', faturado: 0, ateMes: 5 }, hoje)).toThrow();
    expect(() => calcularLimiteMei({ ano: 2026, inicioAtividade: '2026-13', faturado: 0 }, hoje)).toThrow();
    expect(() => calcularLimiteMei({ ano: 2026, faturado: -1 }, hoje)).toThrow();
  });
});
