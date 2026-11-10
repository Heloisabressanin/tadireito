'use client';

import { useMemo, useState } from 'react';
import { AlertasRegras } from '@/components/calc/alertas-regras';
import { Compartilhar } from '@/components/calc/compartilhar';
import { FontesRegras } from '@/components/calc/fontes-regras';
import { CartaoResultado, LinhaResultado, ValorDestaque } from '@/components/calc/cartao-resultado';
import { IconeMegafone } from '@/components/marca/icones';
import { Destaque } from '@/components/pagina-ferramenta';
import { Campo, CartaoCalculadora, Entrada } from '@/components/ui/campo';
import { Etapa } from '@/components/ui/etapa';
import { Segmentado } from '@/components/ui/segmentado';
import { formatarReais } from '@/lib/calc/dinheiro';
import { calcularLimiteMei, type ResultadoLimiteMei, type SituacaoMei } from '@/lib/calc/limite-mei';
import { dataDaUltimaVerificacao } from '@/lib/regras/catalogo';
import { useHoje } from '@/lib/ui/hoje';
import { parseReais } from '@/lib/ui/parse';
import { useBuscaInicial, useSincronizarUrl } from '@/lib/ui/url';

const ANOS = ['2026', '2027', '2028'] as const;
type Ano = (typeof ANOS)[number];

export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function anoInicial(valor: string | null, hoje: string): Ano {
  if (valor && (ANOS as readonly string[]).includes(valor)) return valor as Ano;
  const atual = hoje.slice(0, 4);
  return (ANOS as readonly string[]).includes(atual) ? (atual as Ano) : '2026';
}

function mesInicial(valor: string | null, padrao: number) {
  const n = Number(valor);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : padrao;
}

export function CalculadoraLimiteMei() {
  const busca = useBuscaInicial();
  return <Formulario key={busca} inicial={new URLSearchParams(busca)} />;
}

function Formulario({ inicial }: { inicial: URLSearchParams }) {
  const hoje = useHoje(dataDaUltimaVerificacao);
  const mesAtual = Number(hoje.slice(5, 7));
  // Year and month default to *today*, which is only known after hydration (prerendering uses the
  // last verification date): keep "not chosen" as null so the defaults follow the real date.
  const anoDaUrl = inicial.get('ano');
  const [anoEscolhido, setAno] = useState<Ano | null>(anoDaUrl && (ANOS as readonly string[]).includes(anoDaUrl) ? (anoDaUrl as Ano) : null);
  const ano = anoEscolhido ?? anoInicial(null, hoje);
  const [faturado, setFaturado] = useState(inicial.get('faturado') ?? '58.300,00');
  const [ateEscolhido, setAteMes] = useState<number | null>(inicial.has('ate') ? mesInicial(inicial.get('ate'), mesAtual) : null);
  const ateMes = ateEscolhido ?? mesAtual;
  const [abriuNoAno, setAbriuNoAno] = useState(inicial.has('abertura'));
  const [mesAbertura, setMesAbertura] = useState(mesInicial(inicial.get('abertura'), 1));

  useSincronizarUrl({
    ano,
    faturado,
    ate: String(ateMes),
    abertura: abriuNoAno ? String(mesAbertura) : undefined,
  });

  const valorFaturado = parseReais(faturado);
  const mesesInvalidos = abriuNoAno && ateMes < mesAbertura;

  const resultado = useMemo(() => {
    if (valorFaturado === null || mesesInvalidos) return null;
    return calcularLimiteMei(
      {
        ano: Number(ano),
        faturado: valorFaturado,
        ateMes,
        inicioAtividade: abriuNoAno ? `${ano}-${String(mesAbertura).padStart(2, '0')}` : undefined,
      },
      hoje,
    );
  }, [ano, valorFaturado, ateMes, abriuNoAno, mesAbertura, mesesInvalidos, hoje]);

  return (
    <div className="space-y-7">
      <Etapa numero={1} titulo="Seus dados">
        <CartaoCalculadora>
          <Segmentado nome="ano" rotulo="Ano" opcoes={ANOS.map((a) => ({ valor: a, rotulo: a }))} valor={ano} onChange={setAno} />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={abriuNoAno} onChange={(e) => setAbriuNoAno(e.target.checked)} className="size-5 accent-verde" />
            Abri o MEI em {ano}
          </label>
          {abriuNoAno && (
            <Campo id="abertura" rotulo="Mês de abertura" ajuda="O mês de abertura conta como mês inteiro.">
              <SelectMes id="abertura" valor={mesAbertura} onChange={setMesAbertura} />
            </Campo>
          )}
          <Campo id="faturado" rotulo={`Faturamento em ${ano} até agora`} erro={valorFaturado === null ? 'Digite um valor válido, por exemplo 58.300,00' : undefined}>
            <Entrada id="faturado" prefixo="R$" inputMode="decimal" autoComplete="off" value={faturado} onChange={(e) => setFaturado(e.target.value)} invalido={valorFaturado === null} />
          </Campo>
          <Campo id="ate" rotulo="Faturamento contado até o mês de" erro={mesesInvalidos ? 'Escolha um mês igual ou depois da abertura' : undefined}>
            <SelectMes id="ate" valor={ateMes} onChange={setAteMes} />
          </Campo>
        </CartaoCalculadora>
      </Etapa>

      <Etapa numero={2} titulo="Seu resultado">
        {resultado ? <Resultado resultado={resultado} /> : <p className="rounded-2xl border-2 border-dashed border-tinta/40 bg-white p-4 text-sm text-cinza">Corrija os valores acima para ver o resultado.</p>}
      </Etapa>
    </div>
  );
}

function SelectMes({ id, valor, onChange }: { id: string; valor: number; onChange: (mes: number) => void }) {
  return (
    <select
      id={id}
      value={valor}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-2xl border-[2.5px] border-tinta bg-white px-3.5 py-3 text-lg font-extrabold capitalize outline-none focus:ring-4 focus:ring-amarelo"
    >
      {MESES.map((nome, i) => (
        <option key={nome} value={i + 1}>
          {nome}
        </option>
      ))}
    </select>
  );
}

const MENSAGENS: Record<SituacaoMei, { titulo: string; texto: (r: ResultadoLimiteMei) => string; cor: string }> = {
  'dentro-do-limite': {
    titulo: 'Dentro do limite ✓',
    texto: (r) => `Você ainda pode faturar ${formatarReais(r.restante)} em ${r.ano}.`,
    cor: 'text-verde-escuro',
  },
  'excesso-ate-20': {
    titulo: 'Acima do limite, mas até 20%',
    texto: (r) =>
      `Você continua MEI até o fim de ${r.ano} e passa a ser microempresa em 1º de janeiro de ${r.ano + 1}, pagando a diferença do imposto junto com o DAS de janeiro.`,
    cor: 'text-[#8a5f00]',
  },
  'excesso-acima-de-20': {
    titulo: 'Mais de 20% acima do limite',
    texto: (r) =>
      `O desenquadramento é retroativo a 1º de janeiro de ${r.ano}${r.proporcional ? ' (ou à data de abertura)' : ''}: os impostos passam a ser calculados como microempresa desde então. Procure um contador.`,
    cor: 'text-negativo',
  },
};

function Resultado({ resultado }: { resultado: ResultadoLimiteMei }) {
  const percentual = Math.round(resultado.percentualUsado * 100);
  const mensagem = MENSAGENS[resultado.situacao];
  const { projecao } = resultado;
  const dentro = resultado.situacao === 'dentro-do-limite' && (!projecao || projecao.situacao === 'dentro-do-limite');

  const texto = [
    `Limite do MEI em ${resultado.ano}: ${formatarReais(resultado.limite)}`,
    `Já usei ${percentual}% do limite`,
    projecao && `No ritmo atual, fecho o ano com ${formatarReais(projecao.totalNoAno)}`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="space-y-5">
      <CartaoResultado
        titulo={`Limite do MEI · ${resultado.ano}`}
        anuncio={[
          `Você usou ${percentual}% do limite de ${formatarReais(resultado.limite)}.`,
          `${mensagem.titulo}.`,
          projecao && `No ritmo atual, você fecha ${resultado.ano} com cerca de ${formatarReais(projecao.totalNoAno)}.`,
          projecao?.mesDeEstouro && `O limite seria ultrapassado em ${MESES[projecao.mesDeEstouro - 1]}.`,
        ]
          .filter(Boolean)
          .join(' ')}
        adesivo={{ chave: `${percentual}-${resultado.situacao}-${projecao?.situacao}`, variante: dentro ? 'ok' : 'atencao' }}
      >
        <p className="titulo-display text-3xl">Você usou {percentual}% do limite</p>
        <div
          className="mt-3 mb-2 h-5 overflow-hidden rounded-full border-2 border-tinta bg-white"
          role="progressbar"
          aria-valuenow={percentual}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Parte do limite já usada"
        >
          <div
            className={`h-full transition-[width] duration-500 ${resultado.situacao === 'dentro-do-limite' ? 'bg-verde' : 'bg-negativo'}`}
            style={{ width: `${Math.min(100, percentual)}%` }}
          />
        </div>
        <dl>
          <LinhaResultado rotulo="Limite" valor={resultado.limite} />
          {resultado.proporcional && (
            <LinhaResultado rotulo="Proporcional" texto={`${resultado.mesesNoAno} meses × ${formatarReais(resultado.regra.valor.mensalProporcional)}`} />
          )}
          {projecao && <LinhaResultado rotulo="Média mensal" valor={projecao.mediaMensal} />}
        </dl>
        <div className="mt-3">
          {projecao ? (
            <ValorDestaque rotulo={`Projeção para ${resultado.ano}`} valor={projecao.totalNoAno} />
          ) : (
            <ValorDestaque rotulo="Você ainda pode faturar" valor={resultado.restante} />
          )}
        </div>

        <p className={`mt-4 font-extrabold ${mensagem.cor}`}>{mensagem.titulo}</p>
        <p className="text-[15px] leading-snug">{mensagem.texto(resultado)}</p>
        {projecao && resultado.situacao === 'dentro-do-limite' && (
          <p className="mt-2 text-[15px] leading-snug">
            No ritmo atual ({formatarReais(projecao.mediaMensal)} por mês), você fecha {resultado.ano} com cerca de{' '}
            <strong>{formatarReais(projecao.totalNoAno)}</strong>.{' '}
            {projecao.situacao === 'dentro-do-limite' ? (
              'Nesse ritmo, você fica dentro do limite.'
            ) : (
              <strong className="text-negativo">
                {projecao.mesDeEstouro && `O limite seria ultrapassado em ${MESES[projecao.mesDeEstouro - 1]}`}
                {projecao.situacao === 'excesso-ate-20'
                  ? ', mas até 20% acima: você viraria microempresa no ano seguinte.'
                  : ', mais de 20% acima: o desenquadramento seria retroativo ao início do ano.'}
              </strong>
            )}
          </p>
        )}
      </CartaoResultado>
      {resultado.ano === 2026 && (
        <Destaque icone={<IconeMegafone className="size-9" />} titulo="Em 2027 o limite sobe para R$ 110.000">
          E o MEI poderá ter até 2 funcionários (Lei Complementar 238/2026).
        </Destaque>
      )}
      <Compartilhar texto={texto} />
      <AlertasRegras regras={[resultado.regra]} />
      <FontesRegras regras={[resultado.regra]} />
      <p className="text-xs text-cinza">
        Não somos o governo. O pagamento do DAS é feito no{' '}
        <a
          href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-verde-escuro underline underline-offset-2"
        >
          PGMEI, site oficial da Receita Federal
        </a>
        .
      </p>
    </div>
  );
}
