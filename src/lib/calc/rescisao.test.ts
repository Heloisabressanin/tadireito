import { describe, expect, it } from 'vitest';
import { calcularRescisao, type EntradaRescisao } from './rescisao';

const HOJE = '2026-11-10';
const valor = (r: ReturnType<typeof calcularRescisao>, id: string) => [...r.verbas, ...r.descontos].find((v) => v.id === id)?.valor;

const base: EntradaRescisao = {
  salario: 3000,
  admissao: '2024-03-10',
  saida: '2026-11-10',
  motivo: 'sem-justa-causa',
  aviso: 'indenizado',
  feriasVencidas: 0,
  dependentes: 0,
};

describe('calcularRescisao — dispensa sem justa causa, aviso indenizado', () => {
  const r = calcularRescisao({ ...base, saldoFgts: 5000 }, HOJE);

  it('gives 30 + 3 days of notice per full year and projects it on the contract (Lei 12.506; CLT 487 § 1º)', () => {
    expect(r.anosCompletos).toBe(2);
    expect(r.diasAviso).toBe(36);
    expect(r.dataProjetada).toBe('2026-12-16');
    expect(valor(r, 'aviso')).toBe(3600);
  });

  it('pays salary balance, 13º and vacation counted up to the projected date', () => {
    expect(valor(r, 'saldo')).toBe(1000); // 10 days
    expect(valor(r, '13')).toBe(3000); // 12/12: December has 16 projected days
    expect(valor(r, 'ferias-proporcionais')).toBe(2250); // 9/12 since 10/03/2026 (7 days left over, not counted)
    expect(valor(r, 'terco-proporcionais')).toBe(750);
  });

  it('deducts INSS only on the salary balance and on the 13º, each on its own', () => {
    expect(valor(r, 'inss')).toBe(75);
    expect(valor(r, 'inss13')).toBe(248.6);
    expect(r.totalBruto).toBe(10600);
    expect(r.totalDescontos).toBe(323.6);
    expect(r.liquido).toBe(10276.4);
  });

  it('adds the 40% FGTS penalty on the balance plus the termination deposit, and allows full withdrawal', () => {
    expect(r.fgts.depositoRescisao).toBe(608); // 8% × (1.000 + 3.600 + 3.000)
    expect(r.fgts.multa).toBe(2243.2); // 40% × 5.608
    expect(r.fgts.saquePercentual).toBe(1);
    expect(r.seguroDesemprego).toBe(true);
  });
});

describe('calcularRescisao — other reasons', () => {
  it('pedido de demissão without working the notice: proportional rights, notice deducted, no FGTS', () => {
    const r = calcularRescisao({ ...base, salario: 2000, admissao: '2026-02-01', saida: '2026-08-20', motivo: 'pedido-demissao', aviso: 'nao-cumprido' }, HOJE);
    expect(valor(r, 'saldo')).toBe(1333.33);
    expect(valor(r, '13')).toBe(1166.67); // 7/12
    expect(valor(r, 'ferias-proporcionais')).toBe(1166.67); // 7/12, less than a year (Súmula 261 TST)
    expect(valor(r, 'terco-proporcionais')).toBe(388.89);
    expect(valor(r, 'aviso-nao-cumprido')).toBe(2000);
    expect(valor(r, 'aviso')).toBeUndefined();
    expect(r.liquido).toBe(1868.06);
    expect(r.fgts).toMatchObject({ multa: 0, saquePercentual: 0 });
    expect(r.seguroDesemprego).toBe(false);
  });

  it('justa causa: only salary balance and expired vacation', () => {
    const r = calcularRescisao({ ...base, admissao: '2023-01-15', saida: '2026-06-15', motivo: 'justa-causa', feriasVencidas: 1 }, HOJE);
    expect(r.verbas.map((v) => v.id)).toEqual(['saldo', 'ferias-vencidas', 'terco-vencidas']);
    expect(valor(r, 'saldo')).toBe(1500);
    expect(valor(r, 'ferias-vencidas')).toBe(3000);
    expect(valor(r, 'terco-vencidas')).toBe(1000);
    expect(r.liquido).toBe(5387.5);
    expect(r.fgts.multa).toBe(0);
  });

  it('acordo (CLT 484-A): half the notice, 20% penalty, 80% withdrawal, no unemployment insurance', () => {
    const r = calcularRescisao({ ...base, motivo: 'acordo', saldoFgts: 5000 }, HOJE);
    expect(valor(r, 'aviso')).toBe(1800);
    expect(r.dataProjetada).toBe('2026-11-28');
    expect(valor(r, '13')).toBe(2750); // 11/12
    expect(valor(r, 'ferias-proporcionais')).toBe(2250); // 8 months + 19 days
    expect(r.fgts.multaPercentual).toBe(0.2);
    expect(r.fgts.saquePercentual).toBe(0.8);
    expect(r.seguroDesemprego).toBe(false);
  });
});

describe('calcularRescisao — rules', () => {
  it('caps the notice at 90 days', () => {
    expect(calcularRescisao({ ...base, admissao: '2000-01-01' }, HOJE).diasAviso).toBe(90);
    expect(calcularRescisao({ ...base, admissao: '2025-11-10' }, HOJE).diasAviso).toBe(33); // exactly 1 year
    expect(calcularRescisao({ ...base, admissao: '2025-11-11' }, HOJE).diasAviso).toBe(30);
  });

  it('pays only the extra days beyond 30 when the notice is worked', () => {
    const r = calcularRescisao({ ...base, aviso: 'trabalhado' }, HOJE);
    expect(valor(r, 'aviso')).toBe(600); // 6 extra days
    expect(r.dataProjetada).toBe('2026-11-16');
  });

  it('counts the salary balance on a 30-day month and from the hiring date in the first month', () => {
    expect(valor(calcularRescisao({ ...base, saida: '2026-10-31' }, HOJE), 'saldo')).toBe(3000);
    expect(valor(calcularRescisao({ ...base, admissao: '2026-11-03', saida: '2026-11-10' }, HOJE), 'saldo')).toBe(800);
  });

  it('estimates the FGTS balance when it is not given', () => {
    const r = calcularRescisao(base, HOJE);
    expect(r.fgts.saldoInformado).toBe(false);
    expect(r.fgts.multa).toBeGreaterThan(0);
  });

  it('deducts a 13º advance already received', () => {
    const r = calcularRescisao({ ...base, adiantamento13: 1500 }, HOJE);
    expect(valor(r, 'adiantamento13')).toBe(1500);
  });

  it('rejects inconsistent dates', () => {
    expect(() => calcularRescisao({ ...base, saida: '2020-01-01' }, HOJE)).toThrow();
  });
});
