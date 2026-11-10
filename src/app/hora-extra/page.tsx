import type { Metadata } from 'next';
import Link from 'next/link';
import { IconeCalendario } from '@/components/marca/icones';
import { aplicacaoWeb, DadosEstruturados, perguntasFrequentes } from '@/components/dados-estruturados';
import { Destaque, PaginaFerramenta, Perguntas, type Pergunta } from '@/components/pagina-ferramenta';
import { CalculadoraHoraExtra } from '@/features/hora-extra/calculadora';
import { metadadosPagina } from '@/lib/metadados';

export const metadata: Metadata = metadadosPagina({
  titulo: 'Calculadora de hora extra 2026 com a nova jornada de 42h e 40h',
  descricao:
    'Calcule suas horas extras com 50%, 100% e DSR, e veja quanto passa a valer sua hora com o fim da escala 6x1 (42 horas a partir de 16/12/2026).',
  caminho: '/hora-extra',
});

export default function HoraExtraPage() {
  const perguntas: Pergunta[] = [
    {
      pergunta: 'Quando começa a jornada de 42 horas?',
      resposta:
        'Dois meses após a publicação da Emenda Constitucional 141/2026 no Diário Oficial de 16/10/2026, ou seja, em 16/12/2026. A jornada de 40 horas vem um ano depois.',
    },
    {
      pergunta: 'Meu salário pode diminuir com a nova jornada?',
      resposta: 'Não. A Emenda proíbe qualquer redução de salário, nominal ou proporcional, por causa da redução da jornada.',
    },
    {
      pergunta: 'O adicional de hora extra muda?',
      resposta: 'Não. O mínimo continua sendo 50% sobre a hora normal. O que muda é o valor da hora normal, que fica maior.',
    },
    {
      pergunta: 'Minha empresa já trabalha 40 horas. O que muda para mim?',
      resposta: 'Escolha "40h" na jornada semanal: o divisor 200 já é o aplicado pela Justiça do Trabalho para quem tem jornada de 40 horas.',
    },
  ];
  return (
    <PaginaFerramenta
      caminho="/hora-extra"
      chamada="Fim da escala 6x1"
      titulo="Hora extra com a nova jornada"
      subtitulo="Veja quanto vale sua hora antes e depois de 16/12/2026, com o mesmo salário."
      calculadora={<CalculadoraHoraExtra />}
    >
      <DadosEstruturados
        dados={[
          aplicacaoWeb({ nome: String(metadata.title), descricao: String(metadata.description), caminho: '/hora-extra' }),
          perguntasFrequentes(perguntas),
        ]}
      />
      <Destaque icone={<IconeCalendario />} titulo="A jornada vai mudar">
        Com a Emenda Constitucional 141/2026, a jornada máxima passa para <strong>42 horas por semana em 16/12/2026</strong> e para{' '}
        <strong>40 horas em 16/12/2027</strong>, com dois dias de descanso e sem redução de salário. A calculadora já muda sozinha nessas datas.{' '}
        <Link href="/fim-da-escala-6x1" className="font-semibold text-verde-escuro underline underline-offset-2">
          Entenda o que muda →
        </Link>
      </Destaque>

      <h2>Como a hora extra é calculada</h2>
      <p>
        Para quem recebe por mês, o valor da hora normal é o salário dividido pelo <strong>divisor</strong> da jornada (CLT, art. 64): 220 para 44
        horas semanais. A hora extra vale pelo menos <strong>50% a mais</strong> (Constituição, art. 7º, XVI), ou mais se a convenção coletiva
        prever. Em domingos e feriados, o adicional costuma ser de 100%.
      </p>
      <p>
        Se as horas extras são habituais, elas também entram no <strong>DSR</strong> (descanso semanal remunerado): o total das horas extras é
        dividido pelos dias úteis e multiplicado pelos domingos, feriados e folgas do mês.
      </p>

      <h2>Por que a hora fica mais cara com 42 horas?</h2>
      <p>
        O salário continua o mesmo, mas é dividido por menos horas. Com o mesmo salário, cada hora (normal e extra) passa a valer mais. Até a
        regulamentação oficial, usamos o divisor <strong>210</strong> para 42 horas e <strong>200</strong> para 40 horas, pelo mesmo método do
        divisor 220, e mostramos esses valores como estimados.
      </p>

      <h2>Perguntas frequentes</h2>
      <Perguntas perguntas={perguntas} />
    </PaginaFerramenta>
  );
}
