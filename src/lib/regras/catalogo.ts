import { z } from 'zod';
import decimoTerceiroIrrf from '@/data/regras/decimo-terceiro-irrf.json';
import decimoTerceiroPrazos from '@/data/regras/decimo-terceiro.json';
import divisorHoras from '@/data/regras/divisor-horas.json';
import inssEmpregado from '@/data/regras/inss-empregado.json';
import irrfMensal from '@/data/regras/irrf-mensal.json';
import jornadaSemanal from '@/data/regras/jornada-semanal.json';
import meiLimite from '@/data/regras/mei-limite.json';
import salarioMinimo from '@/data/regras/salario-minimo.json';
import { regraSchema } from './schema';

const reais = z.number().nonnegative();
const aliquota = z.number().min(0).max(1);

/** Brackets must be strictly increasing; `null` (no upper bound) is only allowed last. */
function faixasCrescentes(faixas: { ate: number | null }[]) {
  return faixas.every((faixa, i) => {
    if (faixa.ate === null) return i === faixas.length - 1;
    const anterior = i === 0 ? 0 : faixas[i - 1].ate;
    return anterior !== null && faixa.ate > anterior;
  });
}

export const inssValor = z.object({
  faixas: z
    .array(z.object({ ate: reais, aliquota }))
    .min(1)
    .refine(faixasCrescentes, 'INSS brackets must be increasing'),
});

export const irrfValor = z.object({
  faixas: z
    .array(z.object({ ate: reais.nullable(), aliquota, deducao: reais }))
    .min(1)
    .refine(faixasCrescentes, 'IRRF brackets must be increasing')
    .refine((f) => f[f.length - 1].ate === null, 'The last IRRF bracket must be open-ended'),
  deducaoPorDependente: reais,
  descontoSimplificado: reais,
  reducao: z.object({
    isencaoAte: reais,
    faixaAte: reais,
    constante: reais,
    coeficiente: z.number().positive(),
  }),
});

export const jornadaValor = z.object({
  horas: z.number().int().positive(),
  diasDeRepouso: z.number().int().positive(),
});

export const divisorValor = z.object({ divisor: z.number().int().positive() });

export const meiLimiteValor = z.object({
  anual: reais,
  mensalProporcional: reais,
  toleranciaExcesso: z.number().min(0).max(1),
});

export const salarioMinimoValor = z.object({ mensal: reais });

const mesDia = z.string().regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'Expected MM-DD');

export const decimoTerceiroPrazosValor = z.object({ primeiraParcelaAte: mesDia, segundaParcelaAte: mesDia });

export const decimoTerceiroIrrfValor = z.object({
  /** Whether the simplified monthly discount may replace the legal deductions on the 13º. */
  descontoSimplificado: z.boolean(),
});

export type InssValor = z.infer<typeof inssValor>;
export type IrrfValor = z.infer<typeof irrfValor>;
export type JornadaValor = z.infer<typeof jornadaValor>;
export type DivisorValor = z.infer<typeof divisorValor>;
export type MeiLimiteValor = z.infer<typeof meiLimiteValor>;
export type SalarioMinimoValor = z.infer<typeof salarioMinimoValor>;
export type DecimoTerceiroPrazosValor = z.infer<typeof decimoTerceiroPrazosValor>;
export type DecimoTerceiroIrrfValor = z.infer<typeof decimoTerceiroIrrfValor>;

// Parsed at module load: an invalid rule file fails the build and the tests, never production.
export const regras = {
  inss: regraSchema(inssValor).parse(inssEmpregado),
  irrf: regraSchema(irrfValor).parse(irrfMensal),
  jornada: regraSchema(jornadaValor).parse(jornadaSemanal),
  divisor: regraSchema(divisorValor).parse(divisorHoras),
  meiLimite: regraSchema(meiLimiteValor).parse(meiLimite),
  salarioMinimo: regraSchema(salarioMinimoValor).parse(salarioMinimo),
  decimoTerceiroPrazos: regraSchema(decimoTerceiroPrazosValor).parse(decimoTerceiroPrazos),
  decimoTerceiroIrrf: regraSchema(decimoTerceiroIrrfValor).parse(decimoTerceiroIrrf),
};

export const todasAsRegras = Object.values(regras);

/** Most recent human verification across all rules: the reference date used for prerendered pages. */
export const dataDaUltimaVerificacao = todasAsRegras
  .flatMap((regra) => regra.versoes.map((v) => v.verificadoEm))
  .sort()
  .at(-1) as string;
