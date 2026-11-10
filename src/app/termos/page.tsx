import type { Metadata } from 'next';
import { PaginaTexto } from '@/components/pagina-texto';
import { site } from '@/lib/site';
import { metadadosPagina } from '@/lib/metadados';

export const metadata: Metadata = metadadosPagina({
  titulo: 'Termos de uso',
  descricao:
    'Condições de uso das calculadoras do Tá Direito.',
  caminho: '/termos',
});

export default function TermosPage() {
  return (
    <PaginaTexto chamada="Condições" titulo="Termos de uso" atualizadoEm="28/10/2026">
      <h2>Uso gratuito e informativo</h2>
      <p>
        As calculadoras do {site.name} são gratuitas e servem para fins informativos. Os resultados são estimativas baseadas nas regras oficiais
        em vigor e nos valores que você informa.
      </p>

      <h2>Sem orientação profissional</h2>
      <p>
        O {site.name} não presta consultoria jurídica, contábil ou trabalhista. Para decisões importantes (como pedir demissão, contratar ou mudar
        de regime tributário), consulte o RH da sua empresa, um contador ou um advogado. Seu caso pode ter regras específicas (convenção coletiva,
        acordos, decisões judiciais) que a calculadora não conhece.
      </p>

      <h2>Atualização das regras</h2>
      <p>
        Fazemos o possível para manter os valores atualizados e mostramos a fonte oficial e a data de verificação de cada um. Mesmo assim, a lei
        pode mudar entre duas verificações. Em caso de diferença, vale sempre o texto oficial.
      </p>

      <h2>Não somos o governo</h2>
      <p>
        O {site.name} não tem ligação com órgãos públicos. Pagamentos de impostos (como o DAS do MEI) devem ser feitos apenas nos sites oficiais.
      </p>

      <h2>Contato</h2>
      <p>
        <a href={`mailto:${site.contato}`} className="text-verde-escuro underline">
          {site.contato}
        </a>
      </p>
    </PaginaTexto>
  );
}
