'use client';

import { useState, type ReactNode } from 'react';
import { instalarDireto, useInstalacao, type Plataforma } from './instalacao';

const PASSOS: Record<Plataforma, { titulo: string; passos: ReactNode[] }> = {
  ios: {
    titulo: 'No iPhone ou iPad',
    passos: [
      <>Abra esta página no <strong>Safari</strong> (ou no Chrome).</>,
      <>
        Toque em <strong>Compartilhar</strong> <IconeCompartilhar /> na barra do navegador.
      </>,
      <>
        Role e toque em <strong>Adicionar à Tela de Início</strong>, depois em <strong>Adicionar</strong>.
      </>,
    ],
  },
  android: {
    titulo: 'No Android',
    passos: [
      <>Abra esta página no <strong>Chrome</strong>.</>,
      <>
        Toque no menu <strong>⋮</strong> no canto superior direito.
      </>,
      <>
        Toque em <strong>Instalar app</strong> (ou <strong>Adicionar à tela inicial</strong>) e confirme.
      </>,
    ],
  },
  computador: {
    titulo: 'No computador',
    passos: [
      <>Abra esta página no <strong>Chrome</strong> ou no <strong>Edge</strong>.</>,
      <>
        Clique no ícone de instalação <strong>⊕</strong> no fim da barra de endereço (ou no menu ⋮ → <strong>Instalar Tá Direito</strong>).
      </>,
      <>Pronto: o app abre na sua própria janela, como um programa.</>,
    ],
  },
};

function IconeCompartilhar() {
  return (
    <svg viewBox="0 0 24 24" className="inline size-5 align-text-bottom text-[#007aff]" aria-label="ícone Compartilhar" role="img">
      <path d="M12 3v12M8 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Passos({ plataforma, destaque }: { plataforma: Plataforma; destaque?: boolean }) {
  const { titulo, passos } = PASSOS[plataforma];
  return (
    <div className={`rounded-2xl bg-white p-4 ${destaque ? 'cartao-forte' : 'border-[3px] border-tinta/25'}`}>
      <h3 className="text-lg font-extrabold">{titulo}</h3>
      <ol className="mt-2 space-y-2">
        {passos.map((passo, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-snug">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-tinta text-sm font-bold text-white">
              {i + 1}
            </span>
            <span>{passo}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Install block: one-tap button when the browser allows it, otherwise the steps for the visitor's device first. */
export function InstalarApp() {
  const estado = useInstalacao();
  const [recusou, setRecusou] = useState(false);

  if (estado?.instalada) {
    return (
      <p className="rounded-2xl border-[1.5px] border-verde bg-verde-claro p-4 font-semibold text-verde-escuro" role="status">
        ✓ O Tá Direito já está instalado neste aparelho.
      </p>
    );
  }

  // Before JavaScript runs we can't know the device: Android (most Brazilian phones) comes first, with the same
  // layout as after detection, so nothing jumps when the real platform is known.
  const plataforma = estado?.plataforma ?? 'android';
  const outras = (['android', 'ios', 'computador'] as const).filter((p) => p !== plataforma);

  return (
    <div className="space-y-3">
      {estado?.podeInstalarDireto && (
        <button
          type="button"
          onClick={async () => setRecusou(!(await instalarDireto()))}
          className="cartao-forte titulo-display w-full rounded-2xl bg-amarelo py-4 text-2xl text-tinta hover:-translate-y-0.5"
        >
          Instalar o app grátis
        </button>
      )}
      {recusou && <p className="text-sm text-cinza">Sem problema! Você pode instalar depois pelos passos abaixo.</p>}
      <Passos plataforma={plataforma} destaque />
      <details className="rounded-2xl border-[3px] border-tinta/25 bg-white px-4 py-3">
        <summary className="cursor-pointer font-semibold">Instalar em outro aparelho</summary>
        <div className="mt-3 space-y-3">
          {outras.map((p) => (
            <Passos key={p} plataforma={p} />
          ))}
        </div>
      </details>
    </div>
  );
}
