import type { InputHTMLAttributes, ReactNode } from 'react';

type CampoProps = {
  id: string;
  rotulo: string;
  ajuda?: ReactNode;
  erro?: string;
  children: ReactNode;
};

export function Campo({ id, rotulo, ajuda, erro, children }: CampoProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-extrabold tracking-[0.1em] uppercase">
        {rotulo}
      </label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} className="text-sm font-semibold text-negativo">
          {erro}
        </p>
      ) : (
        ajuda && (
          <p id={`${id}-ajuda`} className="text-xs text-cinza">
            {ajuda}
          </p>
        )
      )}
    </div>
  );
}

type EntradaProps = InputHTMLAttributes<HTMLInputElement> & { prefixo?: string; sufixo?: string; invalido?: boolean };

export function Entrada({ prefixo, sufixo, invalido, className, ...props }: EntradaProps) {
  return (
    <div
      className={`flex items-center rounded-2xl border-[2.5px] bg-white px-3.5 focus-within:ring-4 focus-within:ring-amarelo/70 ${
        invalido ? 'border-negativo' : 'border-tinta'
      }`}
    >
      {prefixo && <span className="titulo-display pr-2 text-xl">{prefixo}</span>}
      <input
        {...props}
        aria-invalid={invalido || undefined}
        className={`titulo-display min-w-0 flex-1 bg-transparent py-3 text-xl outline-none ${className ?? ''}`}
      />
      {sufixo && <span className="pl-2 text-sm font-bold text-cinza">{sufixo}</span>}
    </div>
  );
}

/** Container of a calculator form: bold outlined card. */
export function CartaoCalculadora({ children }: { children: ReactNode }) {
  return <div className="cartao-forte-grande space-y-4 rounded-3xl bg-white p-5">{children}</div>;
}
