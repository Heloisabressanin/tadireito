import type { Metadata } from 'next';
import Link from 'next/link';
import { PaginaTexto } from '@/components/pagina-texto';
import { DIAS_ATE_VERIFICACAO_VENCIDA } from '@/lib/regras/resolver';
import { site } from '@/lib/site';
import { metadadosPagina } from '@/lib/metadados';

export const metadata: Metadata = metadadosPagina({
  titulo: 'Sobre e metodologia',
  descricao:
    'Quem faz o Tá Direito e como verificamos cada valor das calculadoras com as fontes oficiais.',
  caminho: '/sobre',
});

export default function SobrePage() {
  return (
    <PaginaTexto chamada="Metodologia" titulo="Sobre o Tá Direito">
      <p>
        O {site.name} é um projeto independente que oferece calculadoras grátis e simples sobre trabalho e MEI, sempre atualizadas com a lei. Nosso
        objetivo é que qualquer pessoa entenda, em poucos segundos, quanto vai receber ou pagar, e por quê.
      </p>

      <h2>Como garantimos que os valores estão certos</h2>
      <ul>
        <li>
          <strong>Fontes oficiais:</strong> cada alíquota, faixa e limite vem de um texto oficial (Planalto, Receita Federal, INSS, Diário Oficial),
          com link ao lado do resultado.
        </li>
        <li>
          <strong>Mudanças com data:</strong> quando uma lei já publicada muda um valor no futuro, a calculadora passa a usar o novo valor
          automaticamente na data certa.
        </li>
        <li>
          <strong>Verificação periódica:</strong> conferimos os valores regularmente. Se um valor ficar mais de {DIAS_ATE_VERIFICACAO_VENCIDA} dias
          sem verificação, a calculadora mostra um aviso.
        </li>
        <li>
          <strong>Transparência:</strong> quando ainda não existe regra oficial, mostramos o valor como <em>estimado</em> e explicamos o motivo.
        </li>
        <li>
          <strong>Testes:</strong> os cálculos são testados com os exemplos oficiais publicados pela Receita Federal.
        </li>
      </ul>
      <p>
        Todas as mudanças ficam registradas na página <Link href="/atualizacoes" className="text-verde-escuro underline">Atualizações da lei</Link>.
      </p>

      <h2>O que o Tá Direito não é</h2>
      <p>
        Não somos o governo, nem um escritório de contabilidade ou de advocacia. Os resultados são estimativas para fins informativos e não
        substituem a orientação do RH da sua empresa, de um contador ou de um advogado.
      </p>

      <h2>Contato</h2>
      <p>
        Encontrou um erro ou tem uma sugestão? Escreva para{' '}
        <a href={`mailto:${site.contato}`} className="text-verde-escuro underline">
          {site.contato}
        </a>
        . Respondemos e corrigimos o mais rápido possível.
      </p>
    </PaginaTexto>
  );
}
