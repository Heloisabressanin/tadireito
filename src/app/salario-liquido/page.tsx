import type { Metadata } from 'next';
import { IconeLampada } from '@/components/marca/icones';
import { aplicacaoWeb, DadosEstruturados, perguntasFrequentes } from '@/components/dados-estruturados';
import { Destaque, PaginaFerramenta, Perguntas, type Pergunta } from '@/components/pagina-ferramenta';
import { CalculadoraSalarioLiquido } from '@/features/salario-liquido/calculadora';
import { formatarPercentual, formatarReais } from '@/lib/calc/dinheiro';
import { dataDaUltimaVerificacao, regras } from '@/lib/regras/catalogo';
import { resolverRegra } from '@/lib/regras/resolver';
import { metadadosPagina } from '@/lib/metadados';

export const metadata: Metadata = metadadosPagina({
  titulo: 'Calculadora de salário líquido 2026 (INSS + IR atualizado)',
  descricao:
    'Calcule seu salário líquido 2026 em segundos, com as tabelas oficiais do INSS e a nova isenção do Imposto de Renda até R$ 5.000. Grátis e sem anúncio no meio do resultado.',
  caminho: '/salario-liquido',
});

export default function SalarioLiquidoPage() {
  const inss = resolverRegra(regras.inss, dataDaUltimaVerificacao).valor;
  const irrf = resolverRegra(regras.irrf, dataDaUltimaVerificacao).valor;
  const perguntas: Pergunta[] = [
    {
      pergunta: `Quem ganha até R$ 5.000 está mesmo isento do Imposto de Renda?`,
      resposta: `Sim. Desde janeiro de 2026, a Lei 15.270/2025 reduz o imposto mensal a zero para rendimentos de até ${formatarReais(irrf.reducao.isencaoAte)}. A redução também vale para o 13º salário.`,
    },
    {
      pergunta: 'Como os dependentes mudam o cálculo?',
      resposta: `Cada dependente deduz ${formatarReais(irrf.deducaoPorDependente)} da base do Imposto de Renda. A calculadora compara automaticamente com o desconto simplificado e usa o que for melhor para você.`,
    },
    {
      pergunta: 'Por que meu holerite mostra um valor diferente?',
      resposta:
        'O holerite pode ter outros itens: horas extras, adicionais, faltas, vale-transporte, vale-refeição, plano de saúde ou contribuição sindical. Use "Outros descontos" para incluir o que não entra no Imposto de Renda.',
    },
    {
      pergunta: 'O INSS tem um limite?',
      resposta: `Sim. Em 2026 o teto é ${formatarReais(inss.faixas[inss.faixas.length - 1].ate)}: acima disso a contribuição para de aumentar.`,
    },
  ];

  return (
    <PaginaFerramenta
      caminho="/salario-liquido"
      chamada="Tabelas oficiais de 2026"
      titulo="Salário líquido 2026"
      subtitulo="Quanto você recebe de verdade, desconto por desconto, como no seu holerite."
      calculadora={<CalculadoraSalarioLiquido />}
    >
      <DadosEstruturados
        dados={[
          aplicacaoWeb({ nome: String(metadata.title), descricao: String(metadata.description), caminho: '/salario-liquido' }),
          perguntasFrequentes(perguntas),
        ]}
      />
      <Destaque icone={<IconeLampada />} titulo="Novidade de 2026">
        Quem ganha até {formatarReais(irrf.reducao.isencaoAte)} por mês não paga mais Imposto de Renda (Lei 15.270/2025). Entre{' '}
        {formatarReais(irrf.reducao.isencaoAte)} e {formatarReais(irrf.reducao.faixaAte)}, o imposto é reduzido.
      </Destaque>

      <h2>Como o cálculo é feito</h2>
      <p>
        Primeiro descontamos o <strong>INSS</strong>, por faixas: cada parte do salário paga a sua alíquota, até o teto. Depois calculamos o{' '}
        <strong>Imposto de Renda</strong> sobre o que sobra, escolhendo automaticamente a opção mais vantajosa para você: as deduções legais
        (INSS, dependentes e pensão) ou o desconto simplificado de {formatarReais(irrf.descontoSimplificado)}. Por fim aplicamos a redução da nova
        lei.
      </p>

      <h2>Tabela do INSS 2026</h2>
      <table>
        <thead>
          <tr>
            <th>Faixa de salário</th>
            <th>Alíquota</th>
          </tr>
        </thead>
        <tbody>
          {inss.faixas.map((faixa, i) => (
            <tr key={faixa.ate}>
              <td>
                {i === 0 ? 'Até ' : `De ${formatarReais(inss.faixas[i - 1].ate + 0.01)} a `}
                {formatarReais(faixa.ate)}
              </td>
              <td>{formatarPercentual(faixa.aliquota)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Tabela do Imposto de Renda 2026 (mensal)</h2>
      <table>
        <thead>
          <tr>
            <th>Base de cálculo</th>
            <th>Alíquota</th>
            <th>Parcela a deduzir</th>
          </tr>
        </thead>
        <tbody>
          {irrf.faixas.map((faixa, i) => {
            const anterior = i === 0 ? null : irrf.faixas[i - 1].ate;
            return (
              <tr key={faixa.ate ?? 'acima'}>
                <td>
                  {anterior === null
                    ? `Até ${formatarReais(faixa.ate as number)}`
                    : faixa.ate === null
                      ? `Acima de ${formatarReais(anterior)}`
                      : `De ${formatarReais(anterior + 0.01)} a ${formatarReais(faixa.ate)}`}
                </td>
                <td>{faixa.aliquota === 0 ? 'Isento' : formatarPercentual(faixa.aliquota)}</td>
                <td className="whitespace-nowrap">{faixa.deducao === 0 ? '—' : formatarReais(faixa.deducao)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p>
        Dedução por dependente: {formatarReais(irrf.deducaoPorDependente)}. A redução da Lei 15.270/2025 é calculada sobre o salário (rendimento
        tributável), e não sobre a base de cálculo.
      </p>

      <h2>Perguntas frequentes</h2>
      <Perguntas perguntas={perguntas} />
    </PaginaFerramenta>
  );
}
