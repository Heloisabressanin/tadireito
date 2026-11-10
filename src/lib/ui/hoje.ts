'use client';

import { useSyncExternalStore } from 'react';
import { todayInBrazil, type IsoDate } from '@/lib/regras/dates';

const semAssinatura = () => () => {};

/**
 * Today's date in Brasília, read only in the browser.
 * During prerendering (and the first hydration pass) it returns `padrao`, so the static HTML
 * never freezes the build date (Next.js forbids reading the clock while prerendering).
 */
export function useHoje(padrao: IsoDate): IsoDate {
  return useSyncExternalStore(semAssinatura, () => todayInBrazil(), () => padrao);
}
