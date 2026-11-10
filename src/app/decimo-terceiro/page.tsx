import type { Metadata } from 'next';
import { IconeCalendario } from '@/components/marca/icones';
import { aplicacaoWeb, DadosEstruturados, perguntasFrequentes } from '@/components/dados-estruturados';
import { Destaque, PaginaFerramenta, Perguntas, type Pergunta } from '@/components/pagina-ferramenta';
import { CalculadoraDecimoTerceiro } from '@/features/decimo-terceiro/calculadora';
import { metadadosPagina } from '@/lib/metadados';

export const metadata: Metadata = metadadosPagina({
  titulo: 'Calculadora de 13º salário 2026: 1ª e 2ª parcela com INSS e IR',
  descricao:
    'Calcule seu 13º salário 2026 grátis: valor da 1ª parcela (até 30/11) e da 2ª parcela (até 18/12), com INSS, Imposto de Renda e a isenção até R$ 5.000.',
  caminho: '/decimo-terceiro',
});

export default function DecimoTerceiroPage() {
  const perguntas: Pergunta[] = [
    {
      pergunta: 'Quando o 13º salário de 2026 tem que ser pago?',
      resposta:
        'A 1ª parcela vai até 30/11/2026 (segunda-feira). A 2ª parcela tem prazo legal até 20/12, mas em 2026 esse dia cai num domingo, então a empresa deve pagar até sexta-feira, 18/12.',
    },
    {
      pergunta: 'Tem desconto na 1ª parcela?',
      resposta: 'Não. A 1ª parcela é a metade do 13º, sem INSS nem Imposto de Renda. Os descontos ficam todos para a 2ª parcela.',
    },
    {
      pergunta: 'Quem ganha até R$ 5.000 paga Imposto de Renda no 13º?',
      resposta:
        'Não. A Lei 15.270/2025 diz que a redução do imposto também vale para o 13º salário (Lei 9.250, art. 3º-A, § 3º). Até R$ 5.000 o imposto fica zero, e até R$ 7.350 ele diminui.',
    },
    {
      pergunta: 'Comecei a trabalhar no meio do ano. Quanto recebo?',
      resposta:
        'O 13º é proporcional: 1/12 do salário por mês trabalhado. Um mês com 15 dias ou mais de trabalho conta como mês inteiro (Lei 4.090/1962).',
    },
    {
      pergunta: 'Horas extras e comissões entram no 13º?',
      resposta: 'Sim. Se você recebe valores variáveis, a média desses valores no ano entra na conta do 13º.',
    },
  ];
  return (
    <PaginaFerramenta
      caminho="/decimo-terceiro"
      chamada="1ª parcela até 30/11"
      titulo="13º salário 2026"
      subtitulo="Quanto cai em cada parcela, com INSS, IR e a isenção até R$ 5 mil."
      calculadora={<CalculadoraDecimoTerceiro />}
    >
      <DadosEstruturados
        dados={[
          aplicacaoWeb({ nome: String(metadata.title), descricao: String(metadata.description), caminho: '/decimo-terceiro' }),
          perguntasFrequentes(perguntas),
        ]}
      />
      <Destaque icone={<IconeCalendario />} titulo="Datas de 2026">
        <strong>1ª parcela: até segunda-feira, 30/11.</strong> <strong>2ª parcela: até sexta-feira, 18/12</strong> (o prazo legal é 20/12, que cai
        num domingo).
      </Destaque>

      <h2>Como o 13º é calculado</h2>
      <p>
        O 13º salário vale <strong>1/12 do salário de dezembro por mês trabalhado</strong> no ano (Lei 4.090/1962). Quem trabalhou o ano inteiro
        recebe um salário a mais. Se você recebe horas extras, comissões ou adicionais, a <strong>média</strong> desses valores entra na conta.
      </p>
      <p>
        Ele é pago em duas parcelas (Lei 4.749/1965). A <strong>1ª parcela</strong> é a metade, sem descontos. Na <strong>2ª parcela</strong>, a
        empresa desconta o INSS e o Imposto de Renda calculados sobre o 13º inteiro, separados do salário do mês.
      </p>

      <h2>O que mudou no Imposto de Renda do 13º em 2026</h2>
      <p>
        Com a Lei 15.270/2025, quem tem 13º de até <strong>R$ 5.000 não paga Imposto de Renda</strong> sobre ele, e quem tem até R$ 7.350 paga
        menos. A lei diz isso de forma expressa: a redução também se aplica ao imposto retido no pagamento do décimo terceiro salário.
      </p>

      <h2>Perguntas frequentes</h2>
      <Perguntas perguntas={perguntas} />
    </PaginaFerramenta>
  );
}
