import type { Metadata } from 'next';
import Link from 'next/link';
import { DadosEstruturados, perguntasFrequentes } from '@/components/dados-estruturados';
import { Perguntas, type Pergunta } from '@/components/pagina-ferramenta';
import { PaginaTexto } from '@/components/pagina-texto';
import { metadadosPagina } from '@/lib/metadados';

export const metadata: Metadata = metadadosPagina({
  titulo: 'Fim da escala 6x1: quando começa a jornada de 42h e 40h',
  descricao:
    'Tudo sobre a Emenda Constitucional 141/2026: jornada de 42 horas a partir de 16/12/2026, 40 horas em 16/12/2027, dois dias de descanso e sem redução de salário.',
  caminho: '/fim-da-escala-6x1',
});

const ETAPAS = [
  { data: 'Até 15/12/2026', titulo: '44 horas por semana', texto: 'Regra atual: 1 dia de descanso semanal.' },
  { data: '16/12/2026', titulo: '42 horas por semana', texto: '2 dias de descanso por semana, um deles preferencialmente no domingo.' },
  { data: '16/12/2027', titulo: '40 horas por semana', texto: 'Jornada máxima de 8 horas por dia e 40 por semana.' },
];

const PERGUNTAS: Pergunta[] = [
  {
    pergunta: 'Por que 16 de dezembro de 2026?',
    resposta: 'A Emenda diz que a jornada de 42 horas vale 2 meses após a publicação, que foi em 16/10/2026.',
  },
  {
    pergunta: 'Vale para todos os trabalhadores?',
    resposta:
      'A regra vale para os trabalhadores com carteira assinada. A Emenda prevê que uma lei complementar pode criar regras de transição para MEIs, micro e pequenas empresas.',
  },
];

export default function FimDaEscala6x1Page() {
  return (
    <PaginaTexto chamada="Emenda Constitucional 141/2026" titulo="Fim da escala 6x1: o que muda e quando">
      <p>
        A Emenda Constitucional 141/2026, publicada no Diário Oficial em 16/10/2026, reduz a jornada máxima de trabalho e garante dois dias de
        descanso por semana. A mudança acontece em duas etapas, <strong>sem redução de salário</strong>.
      </p>

      <ol className="space-y-2" aria-label="Calendário da transição">
        {ETAPAS.map((etapa) => (
          <li key={etapa.data} className="cartao-forte rounded-2xl bg-white p-4">
            <p className="text-xs font-bold tracking-wide text-cinza uppercase">{etapa.data}</p>
            <p className="titulo-display text-2xl">{etapa.titulo}</p>
            <p className="text-[15px]">{etapa.texto}</p>
          </li>
        ))}
      </ol>

      <Link href="/hora-extra" className="cartao-forte block rounded-2xl bg-amarelo p-4 text-center text-lg font-extrabold text-tinta hover:-translate-y-0.5">
        Calcular quanto vale minha hora extra com 42h →
      </Link>

      <h2>O que muda</h2>
      <ul>
        <li>A jornada máxima cai para 42 horas e depois para 40 horas por semana.</li>
        <li>O descanso semanal remunerado passa a ser de 2 dias.</li>
        <li>Com o mesmo salário e menos horas, o valor da hora (normal e extra) aumenta.</li>
      </ul>

      <h2>O que não muda</h2>
      <ul>
        <li>O salário não pode ser reduzido por causa da nova jornada.</li>
        <li>A hora extra continua valendo no mínimo 50% a mais que a hora normal.</li>
      </ul>

      <h2>O que ainda depende de regulamentação</h2>
      <p>
        O Ministério do Trabalho prepara uma portaria sobre a jornada 5x2. Até lá, ainda não há regra oficial sobre o divisor da hora para 42
        horas nem sobre o cálculo do DSR com dois dias de descanso. Nossas calculadoras mostram esses valores como <strong>estimados</strong> e
        serão atualizadas assim que a regra for publicada.
      </p>

      <h2>Perguntas frequentes</h2>
      <Perguntas perguntas={PERGUNTAS} />
      <DadosEstruturados dados={[perguntasFrequentes(PERGUNTAS)]} />
      
      <p className="text-sm text-cinza">
        Fonte:{' '}
        <a href="https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc141.htm" target="_blank" rel="noopener noreferrer" className="text-verde-escuro underline">
          Emenda Constitucional nº 141/2026
        </a>
        . Conteúdo informativo; não substitui orientação jurídica.
      </p>
    </PaginaTexto>
  );
}
