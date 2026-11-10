'use client';

import { Analytics } from '@vercel/analytics/next';

/**
 * Cookieless visit stats (Vercel Web Analytics): no consent banner needed under LGPD.
 * The calculators keep the typed values in the URL query (?salario=…) so results can be shared;
 * we drop the query before sending so no salary or revenue ever leaves the visitor's device.
 */
export function Estatisticas() {
  return (
    <Analytics
      beforeSend={(evento) => {
        const url = new URL(evento.url);
        url.search = '';
        return { ...evento, url: url.toString() };
      }}
    />
  );
}
