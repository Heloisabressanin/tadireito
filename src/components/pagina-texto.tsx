import type { ReactNode } from 'react';
import { FaixaOndas } from '@/components/marca/faixa';

/** Long-form page (about, privacy, terms, 6x1…): poster header, readable column. */
export function PaginaTexto({ chamada, titulo, atualizadoEm, children }: { chamada?: string; titulo: string; atualizadoEm?: string; children: ReactNode }) {
  return (
    <>
      <FaixaOndas>
        <div className="mx-auto max-w-3xl px-4 pt-9 pb-12 sm:px-6">
          {chamada && <p className="text-xs font-extrabold tracking-[0.14em] text-amarelo-palido uppercase">{chamada}</p>}
          <h1 className="titulo-display mt-1.5 text-[40px] text-balance sm:text-6xl">{titulo}</h1>
          {atualizadoEm && <p className="mt-3 text-sm font-semibold">Última atualização: {atualizadoEm}</p>}
        </div>
      </FaixaOndas>
      <div className="conteudo mx-auto max-w-3xl space-y-4 px-4 pt-8 sm:px-6">{children}</div>
    </>
  );
}
