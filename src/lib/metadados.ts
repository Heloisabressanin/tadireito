import type { Metadata } from 'next';
import { site } from '@/lib/site';

/**
 * Page metadata with matching share tags. Next.js does not copy a page's `title` into Open Graph,
 * so without this every WhatsApp preview would show the site's default title.
 */
export function metadadosPagina({ titulo, descricao, caminho }: { titulo: string; descricao: string; caminho: string }): Metadata {
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: site.name,
      url: caminho,
      title: `${titulo} · ${site.name}`,
      description: descricao,
      images: [site.imagemCompartilhamento],
    },
  };
}
