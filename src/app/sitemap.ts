import type { MetadataRoute } from 'next';
import { dataDaUltimaVerificacao } from '@/lib/regras/catalogo';
import { paginas, paginasInstitucionais, site, tools } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  // Pages change when rules are verified or updated, so that date is an honest "last modified".
  const lastModified = new Date(`${dataDaUltimaVerificacao}T12:00:00-03:00`);
  return [
    { url: site.url, lastModified, changeFrequency: 'weekly', priority: 1 },
    ...tools.map((t) => ({ url: `${site.url}${t.href}`, lastModified, changeFrequency: 'weekly' as const, priority: 0.9 })),
    ...paginas.map((p) => ({ url: `${site.url}${p.href}`, lastModified, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...paginasInstitucionais.map((p) => ({ url: `${site.url}${p.href}`, lastModified, changeFrequency: 'yearly' as const, priority: 0.3 })),
  ];
}
