'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

// Query string of each page when it was first rendered in this visit. Calculators rewrite the URL
// on every change, so we must remember the original one instead of reading location.search again.
const buscasIniciais = new Map<string, string>();
const semAssinatura = () => () => {};

function buscaInicial() {
  const { pathname, search } = window.location;
  if (!buscasIniciais.has(pathname)) buscasIniciais.set(pathname, search);
  return buscasIniciais.get(pathname)!;
}

/**
 * The page's query string from a shared link, read in the browser only ("" while prerendering).
 * Use it as a React `key` so the form remounts once with the shared values after hydration.
 */
export function useBuscaInicial(): string {
  const busca = useSyncExternalStore(semAssinatura, buscaInicial, () => '');
  useEffect(() => {
    const { pathname } = window.location;
    return () => {
      buscasIniciais.delete(pathname);
    };
  }, []);
  return busca;
}

/**
 * Keeps the calculator inputs in the URL so the page can be shared with the same values.
 * Never put personal data (names, CPF) in these parameters.
 */
export function useSincronizarUrl(parametros: Record<string, string | undefined>) {
  const primeira = useRef(true);
  const serializado = JSON.stringify(parametros);

  useEffect(() => {
    // Leave the URL untouched until the user changes something.
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    const busca = new URLSearchParams();
    for (const [chave, valor] of Object.entries(JSON.parse(serializado) as Record<string, string | undefined>)) {
      if (valor !== undefined && valor !== '') busca.set(chave, valor);
    }
    const query = busca.toString();
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
  }, [serializado]);
}

/** Absolute link to the current page with its current inputs. */
export function linkAtual(): string {
  return typeof window === 'undefined' ? '' : window.location.href;
}
