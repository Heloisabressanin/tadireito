import type { ReactNode } from 'react';

/** Green band with the Copacabana boardwalk waves (the brand motif), used at the top of pages. */
export function FaixaOndas({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-verde text-white ${className ?? ''}`}>
      <div aria-hidden="true" className="ondas absolute inset-0 opacity-[0.16]" />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Small tilted tag ("NOVO 42H", "LEI NOVA"), yellow by default. */
export function Adesivo({ children, className, cor = 'amarelo' }: { children: ReactNode; className?: string; cor?: 'amarelo' | 'branco' | 'vidro' }) {
  const cores = {
    amarelo: 'border-2 border-tinta bg-amarelo text-tinta',
    branco: 'border-2 border-tinta bg-white text-tinta',
    // Translucent pill for use on the green band.
    vidro: 'border border-white/30 bg-white/15 text-white',
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold tracking-wide uppercase ${cores[cor]} ${className ?? ''}`}>
      {children}
    </span>
  );
}
