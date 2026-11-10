import { describe, expect, it } from 'vitest';
import { resolverRegra } from './resolver';
import type { Regra } from './schema';

const fonte = [{ titulo: 'Lei de teste', url: 'https://www.planalto.gov.br/' }];

const jornada: Regra<{ horas: number }> = {
  id: 'jornada.semanal',
  titulo: 'Jornada semanal',
  versoes: [
    { vigenteDesde: '1988-10-05', vigenteAte: '2026-12-15', situacao: 'lei', valor: { horas: 44 }, fontes: fonte, verificadoEm: '2026-10-28' },
    { vigenteDesde: '2026-12-16', vigenteAte: '2027-12-15', situacao: 'lei', valor: { horas: 42 }, fontes: fonte, verificadoEm: '2026-10-28' },
    { vigenteDesde: '2027-12-16', situacao: 'lei', valor: { horas: 40 }, fontes: fonte, verificadoEm: '2026-10-28' },
  ],
};

describe('resolverRegra', () => {
  it('switches version exactly on the effective date', () => {
    expect(resolverRegra(jornada, '2026-12-15').valor.horas).toBe(44);
    expect(resolverRegra(jornada, '2026-12-16').valor.horas).toBe(42);
    expect(resolverRegra(jornada, '2027-12-16').valor.horas).toBe(40);
  });

  it('announces the next scheduled version', () => {
    const resolvida = resolverRegra(jornada, '2026-11-01');
    expect(resolvida.proxima?.vigenteDesde).toBe('2026-12-16');
    expect(resolverRegra(jornada, '2028-01-01').proxima).toBeUndefined();
  });

  it('does not depend on the order of versions in the file', () => {
    const shuffled = { ...jornada, versoes: [...jornada.versoes].reverse() };
    expect(resolverRegra(shuffled, '2026-12-20').valor.horas).toBe(42);
  });

  it('falls back to the latest version and warns when every version has expired', () => {
    const inss: Regra<{ teto: number }> = {
      id: 'inss.empregado',
      titulo: 'INSS',
      versoes: [{ vigenteDesde: '2026-01-01', vigenteAte: '2026-12-31', situacao: 'lei', valor: { teto: 8475.55 }, fontes: fonte, verificadoEm: '2026-12-20' }],
    };
    const resolvida = resolverRegra(inss, '2027-01-10');
    expect(resolvida.valor.teto).toBe(8475.55);
    expect(resolvida.alertas).toContain('sem-versao-vigente');
  });

  it('warns when the last human check is older than 45 days, measured from today', () => {
    expect(resolverRegra(jornada, '2026-12-12').alertas).toEqual([]);
    expect(resolverRegra(jornada, '2026-12-13').alertas).toEqual(['verificacao-vencida']);
    // Simulating a future date with today's fresh check is fine.
    expect(resolverRegra(jornada, '2027-06-01', '2026-11-01').alertas).toEqual([]);
  });

  it('flags proposed values', () => {
    const minimo: Regra<{ valor: number }> = {
      id: 'salario-minimo',
      titulo: 'Salário mínimo',
      versoes: [
        { vigenteDesde: '2026-01-01', vigenteAte: '2026-12-31', situacao: 'lei', valor: { valor: 1621 }, fontes: fonte, verificadoEm: '2026-10-28' },
        { vigenteDesde: '2027-01-01', situacao: 'proposta', valor: { valor: 1741 }, fontes: fonte, verificadoEm: '2026-10-28' },
      ],
    };
    expect(resolverRegra(minimo, '2027-01-02').alertas).toContain('valor-previsto');
    expect(resolverRegra(minimo, '2026-10-28').alertas).not.toContain('valor-previsto');
  });

  it('throws for a date before the first known version', () => {
    expect(() => resolverRegra(jornada, '1980-01-01')).toThrow(/no version/);
  });
});
