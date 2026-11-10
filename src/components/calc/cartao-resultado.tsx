'use client';

import type { ReactNode } from 'react';
import { formatarReais } from '@/lib/calc/dinheiro';
import { useContagem } from '@/lib/ui/contagem';

/** Amount that counts up to its new value. Screen readers get only the final value (in the live region). */
export function ValorAnimado({ valor, className }: { valor: number; className?: string }) {
  const exibido = useContagem(valor);
  return (
    <span className={className} aria-hidden="true">
      {formatarReais(exibido)}
    </span>
  );
}

/** "TÁ DIREITO ✓" sticker slapped on the result. Changing `chave` replays the animation (on every new result). */
function AdesivoResultado({ chave, variante }: { chave: string; variante: 'ok' | 'atencao' }) {
  const ok = variante === 'ok';
  return (
    <span
      key={chave}
      aria-hidden="true"
      className={`animate-carimbo pointer-events-none absolute -top-4 right-4 rounded-full border-[2.5px] border-tinta px-3.5 py-1.5 text-sm font-extrabold tracking-wide shadow-[3px_3px_0_var(--color-tinta)] ${
        ok ? 'bg-amarelo text-tinta' : 'bg-negativo text-white'
      }`}
    >
      {ok ? 'TÁ DIREITO ✓' : 'ATENÇÃO!'}
    </span>
  );
}

type CartaoResultadoProps = {
  /** Short label at the top of the card, also the group's accessible name. */
  titulo: string;
  /** Text read by screen readers when the result changes (the visual amounts are animated). */
  anuncio: string;
  adesivo?: { chave: string; variante?: 'ok' | 'atencao' };
  children: ReactNode;
};

/** Result card: thick outline, offset shadow, a sticker on the corner. */
export function CartaoResultado({ titulo, anuncio, adesivo, children }: CartaoResultadoProps) {
  return (
    <div role="group" aria-label={titulo} className="cartao-forte-grande relative rounded-3xl bg-white p-5 text-tinta">
      <p className="sr-only" aria-live="polite">
        {anuncio}
      </p>
      {adesivo && <AdesivoResultado chave={adesivo.chave} variante={adesivo.variante ?? 'ok'} />}
      <p className="mb-3 pr-36 text-xs font-extrabold tracking-[0.12em] uppercase">{titulo}</p>
      {children}
    </div>
  );
}

/** The big green box with the main amount. */
export function ValorDestaque({ rotulo, valor, children }: { rotulo: string; valor: number; children?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-verde px-4 py-3.5 text-white">
      <p className="text-xs font-extrabold tracking-[0.12em] uppercase">{rotulo}</p>
      <ValorAnimado valor={valor} className="titulo-display mt-1 block text-[42px] sm:text-5xl" />
      {children}
    </div>
  );
}

/** One detail line: label on the left, amount on the right (definition list semantics). */
export function LinhaResultado({
  rotulo,
  valor,
  negativo,
  texto,
  detalhe,
}: {
  rotulo: ReactNode;
  valor?: number;
  negativo?: boolean;
  texto?: string;
  detalhe?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b-2 border-dashed border-tinta/15 py-2.5 text-[15px] font-semibold last:border-b-0">
      <dt>{rotulo}</dt>
      <dd className={`whitespace-nowrap font-extrabold ${negativo && valor ? 'text-negativo' : ''}`}>
        {texto ?? (valor !== undefined && `${negativo && valor > 0 ? '− ' : ''}${formatarReais(valor)}`)}
      </dd>
      {detalhe && <dd className="basis-full pt-1 text-[13px] leading-snug font-normal text-cinza">{detalhe}</dd>}
    </div>
  );
}
