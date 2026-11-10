'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CartaoResultado, ValorDestaque } from '@/components/calc/cartao-resultado';
import { formatarReais } from '@/lib/calc/dinheiro';
import { calcularSalarioLiquido } from '@/lib/calc/salario-liquido';
import { dataDaUltimaVerificacao } from '@/lib/regras/catalogo';
import { useHoje } from '@/lib/ui/hoje';
import { parseReais } from '@/lib/ui/parse';

/** Home hero calculator: the real engine, a single field, the full page one tap away. */
export function CalculadoraRapida() {
  const hoje = useHoje(dataDaUltimaVerificacao);
  const [salario, setSalario] = useState('3.500,00');
  const valor = parseReais(salario);
  const resultado = useMemo(
    () => (valor === null ? null : calcularSalarioLiquido({ salarioBruto: valor, dependentes: 0 }, hoje, hoje)),
    [valor, hoje],
  );

  return (
    <CartaoResultado
      titulo="Calcule agora"
      anuncio={resultado ? `Você recebe ${formatarReais(resultado.salarioLiquido)}` : 'Digite um valor válido'}
      adesivo={resultado ? { chave: String(resultado.salarioLiquido) } : undefined}
    >
      <label htmlFor="salario-rapido" className="block text-xs font-extrabold tracking-[0.1em] uppercase">
        Seu salário bruto
      </label>
      <div className="titulo-display mt-1 mb-4 flex items-center gap-2 border-b-[3px] border-tinta pb-1 text-3xl">
        R$
        <input
          id="salario-rapido"
          inputMode="decimal"
          autoComplete="off"
          value={salario}
          onChange={(e) => setSalario(e.target.value)}
          aria-invalid={valor === null || undefined}
          className="w-full min-w-0 bg-transparent outline-none"
        />
      </div>
      {resultado ? (
        <>
          <ValorDestaque rotulo="Você recebe" valor={resultado.salarioLiquido} />
          <div className="mt-3 flex flex-wrap gap-2 text-[13px] font-extrabold">
            <span className="rounded-full border-[2.5px] border-tinta bg-white px-3 py-1">INSS − {formatarReais(resultado.inss.total)}</span>
            <span className={`rounded-full border-[2.5px] border-tinta px-3 py-1 ${resultado.irrf.imposto === 0 ? 'bg-amarelo' : 'bg-white'}`}>
              {resultado.irrf.imposto === 0 ? 'IR ISENTO' : `IR − ${formatarReais(resultado.irrf.imposto)}`}
            </span>
          </div>
          <Link
            href={`/salario-liquido?salario=${encodeURIComponent(salario)}`}
            className="mt-4 block rounded-2xl bg-tinta py-3 text-center font-extrabold text-white hover:bg-verde-escuro"
          >
            Ver o cálculo completo →
          </Link>
        </>
      ) : (
        <p className="py-4 text-sm font-semibold text-negativo">Digite um valor válido, por exemplo 3.500,00</p>
      )}
    </CartaoResultado>
  );
}
