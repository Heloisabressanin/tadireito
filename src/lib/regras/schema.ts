import { z } from 'zod';
import { isIsoDate } from './dates';

// Rules are validated in the browser too, and our CSP forbids eval: skip zod's JIT compilation
// (otherwise its `new Function` probe shows up as a CSP violation in the console).
z.config({ jitless: true });

const isoDate = z.string().refine(isIsoDate, { message: 'Expected a valid YYYY-MM-DD date' });

export const fonteSchema = z.object({
  titulo: z.string().min(1),
  url: z.url(),
});

/**
 * One version of a legal rule, valid between two dates.
 * - `lei`: published in an official act (law, decree, ordinance).
 * - `proposta`: announced or pending (e.g. a minimum wage in the budget bill); shown as "valor previsto".
 * - `interpretacao`: no official text sets the value yet; we derive it from the law and say so ("valor estimado").
 */
export const versaoSchema = <T extends z.ZodType>(valor: T) =>
  z
    .object({
      vigenteDesde: isoDate,
      /** Last day the version applies (inclusive). Omitted while it has no known end. */
      vigenteAte: isoDate.optional(),
      situacao: z.enum(['lei', 'proposta', 'interpretacao']),
      valor,
      fontes: z.array(fonteSchema).min(1),
      /** Last time a human checked the values against the official sources. */
      verificadoEm: isoDate,
      nota: z.string().optional(),
    })
    .refine((v) => !v.vigenteAte || v.vigenteAte >= v.vigenteDesde, {
      message: 'vigenteAte must not be before vigenteDesde',
    });

export const regraSchema = <T extends z.ZodType>(valor: T) =>
  z
    .object({
      id: z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)*$/),
      titulo: z.string().min(1),
      versoes: z.array(versaoSchema(valor)).min(1),
    })
    .superRefine((regra, ctx) => {
      const sorted = [...regra.versoes].sort((a, b) => a.vigenteDesde.localeCompare(b.vigenteDesde));
      for (let i = 1; i < sorted.length; i++) {
        const previous = sorted[i - 1];
        const current = sorted[i];
        if (previous.vigenteDesde === current.vigenteDesde) {
          ctx.addIssue({ code: 'custom', message: `Two versions start on ${current.vigenteDesde}` });
        }
        if (previous.vigenteAte && previous.vigenteAte >= current.vigenteDesde) {
          ctx.addIssue({ code: 'custom', message: `Versions overlap around ${current.vigenteDesde}` });
        }
      }
    });

export type Fonte = z.infer<typeof fonteSchema>;
export type Versao<T> = {
  vigenteDesde: string;
  vigenteAte?: string;
  situacao: 'lei' | 'proposta' | 'interpretacao';
  valor: T;
  fontes: Fonte[];
  verificadoEm: string;
  nota?: string;
};
export type Regra<T> = { id: string; titulo: string; versoes: Versao<T>[] };
