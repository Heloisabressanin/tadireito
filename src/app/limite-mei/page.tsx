import type { Metadata } from 'next';
import { IconeMegafone } from '@/components/marca/icones';
import { aplicacaoWeb, DadosEstruturados, perguntasFrequentes } from '@/components/dados-estruturados';
import { Destaque, PaginaFerramenta, Perguntas, type Pergunta } from '@/components/pagina-ferramenta';
import { CalculadoraLimiteMei } from '@/features/limite-mei/calculadora';
import { formatarReais } from '@/lib/calc/dinheiro';
import { regras } from '@/lib/regras/catalogo';
import { resolverRegra } from '@/lib/regras/resolver';
import { metadadosPagina } from '@/lib/metadados';

export const metadata: Metadata = metadadosPagina({
  titulo: 'Limite do MEI 2026, 2027 e 2028: calculadora com a nova lei',
  descricao:
    'Veja quanto do limite do MEI você já usou, quando ele seria ultrapassado e o que muda com a Lei Complementar 238/2026: R$ 110 mil em 2027 e R$ 140 mil em 2028.',
  caminho: '/limite-mei',
});

export default function LimiteMeiPage() {
  const limite = (ano: number) => resolverRegra(regras.meiLimite, `${ano}-01-01`).valor;
  const perguntas: Pergunta[] = [
    {
      pergunta: 'O novo limite de R$ 110 mil já está valendo?',
      resposta: 'Não. Ele vale para o faturamento de 2027, a partir de 1º de janeiro de 2027. Em 2026 o limite continua R$ 81.000.',
    },
    {
      pergunta: 'O aumento do limite é garantido?',
      resposta:
        'A lei já foi publicada, mas o artigo 3º condiciona o aumento à previsão nas leis orçamentárias de 2027 a 2029. Acompanhamos e atualizamos a calculadora se algo mudar.',
    },
    {
      pergunta: 'A calculadora considera as dívidas perdoadas pela nova lei?',
      resposta: 'Não: ela trata só do limite de faturamento. O perdão das dívidas exige pagar o DAS em dia por 6 meses.',
    },
  ];

  return (
    <PaginaFerramenta
      caminho="/limite-mei"
      chamada="Lei Complementar 238/2026"
      titulo="Limite do MEI 2026, 2027 e 2028"
      subtitulo="Quanto você ainda pode faturar este ano, já com a nova lei."
      calculadora={<CalculadoraLimiteMei />}
    >
      <DadosEstruturados
        dados={[
          aplicacaoWeb({ nome: String(metadata.title), descricao: String(metadata.description), caminho: '/limite-mei' }),
          perguntasFrequentes(perguntas),
        ]}
      />
      <Destaque icone={<IconeMegafone />} titulo="Nova lei do MEI (LC 238/2026)">
        O limite de faturamento sobe de {formatarReais(limite(2026).anual)} para <strong>{formatarReais(limite(2027).anual)} em 2027</strong> e{' '}
        <strong>{formatarReais(limite(2028).anual)} a partir de 2028</strong>. O MEI também poderá contratar até 2 funcionários a partir de 2027.
      </Destaque>

      <h2>Limites por ano</h2>
      <table>
        <thead>
          <tr>
            <th>Ano</th>
            <th>Limite anual</th>
            <th>Por mês (quem abriu no ano)</th>
          </tr>
        </thead>
        <tbody>
          {[2026, 2027, 2028].map((ano) => (
            <tr key={ano}>
              <td>{ano === 2028 ? '2028 em diante' : ano}</td>
              <td className="whitespace-nowrap">{formatarReais(limite(ano).anual)}</td>
              <td className="whitespace-nowrap">{formatarReais(limite(ano).mensalProporcional)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Abri o MEI no meio do ano: qual é meu limite?</h2>
      <p>
        O limite é proporcional: o valor mensal multiplicado pelos meses entre a abertura e dezembro. O mês de abertura conta como mês inteiro. Quem
        abriu em julho de 2026, por exemplo, tem limite de 6 × {formatarReais(limite(2026).mensalProporcional)} ={' '}
        {formatarReais(6 * limite(2026).mensalProporcional)}.
      </p>

      <h2>E se eu passar do limite?</h2>
      <ul>
        <li>
          <strong>Até 20% acima:</strong> você continua MEI até o fim do ano e vira microempresa em 1º de janeiro do ano seguinte, pagando a
          diferença do imposto junto com o DAS de janeiro.
        </li>
        <li>
          <strong>Mais de 20% acima:</strong> o desenquadramento é retroativo a 1º de janeiro do ano (ou à data de abertura). Os impostos do ano
          inteiro passam a ser calculados como microempresa.
        </li>
      </ul>

      <h2>Perguntas frequentes</h2>
      <Perguntas perguntas={perguntas} />
    </PaginaFerramenta>
  );
}
