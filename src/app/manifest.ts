import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} · Calculadoras atualizadas com a lei`,
    short_name: site.name,
    description: site.description,
    lang: 'pt-BR',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f8f5',
    theme_color: '#0e7c4a',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
