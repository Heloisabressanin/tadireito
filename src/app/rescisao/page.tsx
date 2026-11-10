import type { Metadata } from 'next';
import { IconeDocumento } from '@/components/marca/icones';
import { aplicacaoWeb, DadosEstruturados, perguntasFrequentes } from '@/components/dados-estruturados';
import { Destaque, PaginaFerramenta, Perguntas, type Pergunta } from '@/components/pagina-ferramenta';
import { CalculadoraRescisao } from '@/features/rescisao/calculadora';
import { metadadosPagina } from '@/lib/metadados';

export const metadata: Metadata = metadadosPagina({
  titulo: 'Calculadora de rescisão 2026: demissão, pedido de demissão, acordo e justa causa',
  descricao:
    'Calcule sua rescisão grátis: saldo de salário, aviso prévio proporcional, 13º e férias proporcionais, multa de 40% do FGTS, com INSS e IR de 2026.',
  caminho: '/rescisao',
});

export default function RescisaoPage() {
  const perguntas: Pergunta[] = [
    {
      pergunta: 'Qual o prazo para a empresa pagar a rescisão?',
      resposta: 'Até 10 dias corridos depois do fim do contrato, em qualquer tipo de saída (CLT, art. 477, § 6º).',
    },
    {
      pergunta: 'Quantos dias de aviso prévio eu tenho?',
      resposta:
        'Quando a empresa te dispensa, são 30 dias mais 3 dias por ano completo de empresa, até 90 dias (Lei 12.506/2011). Quando você pede demissão, o aviso é de 30 dias.',
    },
    {
      pergunta: 'Pedi demissão. O que eu recebo?',
      resposta:
        'Saldo de salário, 13º proporcional, férias vencidas e proporcionais com 1/3. Não há multa do FGTS, saque do FGTS nem seguro-desemprego. Se você não cumprir o aviso, a empresa pode descontar 30 dias.',
    },
    {
      pergunta: 'Como funciona a demissão por acordo?',
      resposta:
        'Você recebe metade do aviso prévio indenizado e metade da multa do FGTS (20%), pode sacar 80% do FGTS e recebe as demais verbas inteiras. Não há seguro-desemprego (CLT, art. 484-A).',
    },
    {
      pergunta: 'Fui demitido por justa causa. Tenho direito a quê?',
      resposta: 'Ao saldo de salário e às férias vencidas com 1/3. Não há 13º proporcional, férias proporcionais, aviso prévio nem multa do FGTS.',
    },
    {
      pergunta: 'Tem desconto de INSS e Imposto de Renda na rescisão?',
      resposta:
        'Só sobre o saldo de salário e sobre o 13º, calculados separados. Férias indenizadas e aviso prévio indenizado não têm INSS nem Imposto de Renda.',
    },
  ];
  return (
    <PaginaFerramenta
      caminho="/rescisao"
      chamada="Todos os tipos de saída"
      titulo="Calculadora de rescisão"
      subtitulo="Quanto você recebe ao sair da empresa, verba por verba, com a lei de 2026."
      calculadora={<CalculadoraRescisao />}
    >
      <DadosEstruturados
        dados={[
          aplicacaoWeb({ nome: String(metadata.title), descricao: String(metadata.description), caminho: '/rescisao' }),
          perguntasFrequentes(perguntas),
        ]}
      />
      <Destaque icone={<IconeDocumento />} titulo="Confira o seu termo de rescisão">
        A empresa precisa discriminar cada verba no termo de rescisão (CLT, art. 477, § 2º). Compare linha por linha com o resultado ao lado e, se
        algo não bater, peça explicação antes de assinar.
      </Destaque>

      <h2>O que entra na rescisão</h2>
      <p>
        <strong>Saldo de salário</strong>: os dias trabalhados no último mês. <strong>Aviso prévio</strong>: 30 dias mais 3 por ano completo,
        quando a empresa te dispensa. <strong>13º proporcional</strong>: 1/12 por mês trabalhado no ano. <strong>Férias</strong>: as vencidas e as
        proporcionais, sempre com <strong>1/3 a mais</strong>.
      </p>
      <p>
        Quando o aviso é indenizado, os dias dele contam como tempo de serviço (CLT, art. 487, § 1º): podem aumentar o 13º e as férias
        proporcionais. A calculadora já faz essa conta.
      </p>

      <h2>FGTS e multa de 40%</h2>
      <p>
        Na dispensa sem justa causa, a empresa deposita uma multa de <strong>40% sobre todo o saldo do FGTS</strong> do contrato (Lei 8.036/1990,
        art. 18), e você pode sacar o saldo. No acordo, a multa é de 20% e o saque, de 80%. Para o valor exato, informe o saldo que aparece no app
        FGTS.
      </p>

      <h2>Perguntas frequentes</h2>
      <Perguntas perguntas={perguntas} />
    </PaginaFerramenta>
  );
}
