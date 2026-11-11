import type { Pergunta } from '@/components/pagina-ferramenta';
import { site } from '@/lib/site';

/** JSON-LD for search engines. `<` is escaped so the content can never close the script tag. */
export function DadosEstruturados({ dados }: { dados: object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados.length === 1 ? dados[0] : dados).replace(/</g, '\\u003c') }}
    />
  );
}

export function aplicacaoWeb({ nome, descricao, caminho }: { nome: string; descricao: string; caminho: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: nome,
    description: descricao,
    url: `${site.url}${caminho}`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    publisher: { '@type': 'Organization', name: site.name, url: site.url, sameAs: [site.redes.tiktok.url] },
  };
}

export function perguntasFrequentes(perguntas: Pergunta[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: perguntas.map((p) => ({
      '@type': 'Question',
      name: p.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: p.resposta },
    })),
  };
}
