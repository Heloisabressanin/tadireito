'use client';

import { useState } from 'react';
import { linkAtual } from '@/lib/ui/url';

/** WhatsApp + copy buttons. The text is a short summary followed by the link with the same inputs. */
export function Compartilhar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  function mensagem() {
    return `${texto}\n\nCalcule o seu: ${linkAtual()}`;
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensagem());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="flex gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(texto)}`}
        onClick={(evento) => {
          evento.currentTarget.href = `https://wa.me/?text=${encodeURIComponent(mensagem())}`;
        }}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 rounded-2xl border-[2.5px] border-tinta bg-whatsapp py-3 text-center text-[15px] font-extrabold text-white shadow-[4px_4px_0_var(--color-tinta)] hover:brightness-95"
      >
        Enviar no WhatsApp
      </a>
      <button
        type="button"
        onClick={copiar}
        className="flex-1 rounded-2xl border-[2.5px] border-tinta bg-white py-3 text-[15px] font-extrabold shadow-[4px_4px_0_var(--color-tinta)] hover:bg-amarelo-claro"
      >
        <span aria-live="polite">{copiado ? 'Copiado ✓' : 'Copiar resultado'}</span>
      </button>
    </div>
  );
}
