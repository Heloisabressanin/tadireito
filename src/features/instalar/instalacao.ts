'use client';

import { useSyncExternalStore } from 'react';

/** Chrome/Edge event that allows a custom "install" button (not available on iOS). */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export type Plataforma = 'ios' | 'android' | 'computador';
export type EstadoInstalacao = { plataforma: Plataforma; instalada: boolean; podeInstalarDireto: boolean };

let promptAdiado: BeforeInstallPromptEvent | null = null;
let instaladaAgora = false;
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((ouvinte) => ouvinte());

// Registered as soon as this module loads: the browser may fire the event before React mounts.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault();
    promptAdiado = evento as BeforeInstallPromptEvent;
    avisar();
  });
  window.addEventListener('appinstalled', () => {
    promptAdiado = null;
    instaladaAgora = true;
    avisar();
  });
}

function detectarPlataforma(): Plataforma {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac; touch support gives it away.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'computador';
}

function estaInstalada() {
  const naTelaInicial = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return instaladaAgora || naTelaInicial || iosStandalone;
}

// useSyncExternalStore needs a stable snapshot: rebuild it only when something changed.
let ultimo: EstadoInstalacao | null = null;
function lerEstado(): EstadoInstalacao {
  const atual = { plataforma: detectarPlataforma(), instalada: estaInstalada(), podeInstalarDireto: promptAdiado !== null };
  if (!ultimo || ultimo.plataforma !== atual.plataforma || ultimo.instalada !== atual.instalada || ultimo.podeInstalarDireto !== atual.podeInstalarDireto) {
    ultimo = atual;
  }
  return ultimo;
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

/** Platform and install state, read in the browser only (`null` while prerendering). */
export function useInstalacao(): EstadoInstalacao | null {
  return useSyncExternalStore(assinar, lerEstado, () => null);
}

/** Opens the browser's install dialog when available. Resolves to true if the user accepted. */
export async function instalarDireto(): Promise<boolean> {
  if (!promptAdiado) return false;
  const evento = promptAdiado;
  promptAdiado = null;
  await evento.prompt();
  const { outcome } = await evento.userChoice;
  avisar();
  return outcome === 'accepted';
}
