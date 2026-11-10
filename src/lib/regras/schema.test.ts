import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { regraSchema } from './schema';

const schema = regraSchema(z.object({ horas: z.number() }));
const fontes = [{ titulo: 'EC 141/2026', url: 'https://www.planalto.gov.br/' }];
const base = { situacao: 'lei' as const, fontes, verificadoEm: '2026-10-28' };

describe('regraSchema', () => {
  it('accepts consecutive versions', () => {
    const result = schema.safeParse({
      id: 'jornada.semanal',
      titulo: 'Jornada',
      versoes: [
        { ...base, vigenteDesde: '1988-10-05', vigenteAte: '2026-12-15', valor: { horas: 44 } },
        { ...base, vigenteDesde: '2026-12-16', valor: { horas: 42 } },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects overlapping versions', () => {
    const result = schema.safeParse({
      id: 'jornada.semanal',
      titulo: 'Jornada',
      versoes: [
        { ...base, vigenteDesde: '1988-10-05', vigenteAte: '2026-12-20', valor: { horas: 44 } },
        { ...base, vigenteDesde: '2026-12-16', valor: { horas: 42 } },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a version without an official source or with an invalid date', () => {
    expect(
      schema.safeParse({ id: 'x', titulo: 'X', versoes: [{ ...base, fontes: [], vigenteDesde: '2026-01-01', valor: { horas: 44 } }] }).success,
    ).toBe(false);
    expect(
      schema.safeParse({ id: 'x', titulo: 'X', versoes: [{ ...base, vigenteDesde: '2026-02-30', valor: { horas: 44 } }] }).success,
    ).toBe(false);
  });
});
