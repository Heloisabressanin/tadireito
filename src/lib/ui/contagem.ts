'use client';

import { useEffect, useRef, useState } from 'react';

const DURACAO_MS = 650;

function prefereMenosMovimento() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animates a number towards `valor` whenever it changes (ease-out, ~0.65s).
 * The first render shows the final value, so prerendered HTML and hydration match.
 */
export function useContagem(valor: number): number {
  const [exibido, setExibido] = useState(valor);
  const anterior = useRef(valor);

  useEffect(() => {
    const de = anterior.current;
    anterior.current = valor;
    if (de === valor) return;
    if (prefereMenosMovimento()) {
      const id = requestAnimationFrame(() => setExibido(valor));
      return () => cancelAnimationFrame(id);
    }
    const inicio = performance.now();
    let quadro = 0;
    const passo = (agora: number) => {
      const k = Math.min(1, (agora - inicio) / DURACAO_MS);
      const suave = 1 - (1 - k) ** 3;
      setExibido(de + (valor - de) * suave);
      if (k < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [valor]);

  return exibido;
}
