import type { ReactNode } from 'react';

/** Numbered step heading ("1 · Seus dados", "2 · Seu resultado") so people always know where they are. */
export function Etapa({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  const id = `etapa-${numero}`;
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="inline-flex items-center gap-2.5 rounded-full border-2 border-tinta bg-white py-1 pr-4 pl-1 text-sm font-extrabold tracking-[0.1em] text-tinta uppercase">
        <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-tinta text-sm text-white">
          {numero}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}
