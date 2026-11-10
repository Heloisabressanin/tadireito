'use client';

import { useMemo, useState } from 'react';
import { AlertasRegras } from '@/components/calc/alertas-regras';
import { CartaoResultado, LinhaResultado, ValorDestaque } from '@/components/calc/cartao-resultado';
import { Compartilhar } from '@/components/calc/compartilhar';
import { FontesRegras } from '@/components/calc/fontes-regras';
import { Campo, CartaoCalculadora, Entrada } from '@/components/ui/campo';
import { Etapa } from '@/components/ui/etapa';
import { Segmentado } from '@/components/ui/segmentado';
import { formatarPercentual, formatarReais } from '@/lib/calc/dinheiro';
import { calcularRescisao, type Aviso, type Motivo } from '@/lib/calc/rescisao';
import { dataDaUltimaVerificacao } from '@/lib/regras/catalogo';
import { formatDateBr, isIsoDate } from '@/lib/regras/dates';
import { useHoje } from '@/lib/ui/hoje';
import { parseReais } from '@/lib/ui/parse';
import { useBuscaInicial, useSincronizarUrl } from '@/lib/ui/url';

const MOTIVOS: { valor: Motivo; rotulo: string }[] = [
  { valor: 'sem-justa-causa', rotulo: 'Demitido' },
  { valor: 'pedido-demissao', rotulo: 'Pedi demissão' },
  { valor: 'acordo', rotulo: 'Acordo' },
  { valor: 'justa-causa', rotulo: 'Justa causa' },
];
const EXPLICACAO: Record<Motivo, string> = {
  'sem-justa-causa': 'A empresa te dispensou sem justa causa.',
  'pedido-demissao': 'Você pediu para sair.',
  acordo: 'Saída combinada entre você e a empresa (CLT, art. 484-A).',
  'justa-causa': 'A empresa te dispensou por falta grave.',
};
const DEPENDENTES = ['0', '1', '2', '3', '4', '5'] as const;
type Dependentes = (typeof DEPENDENTES)[number];
const VENCIDAS = ['0', '1', '2'] as const;
type Vencidas = (typeof VENCIDAS)[number];

const escolher = <T extends string>(lista: readonly T[], valor: string | null, padrao: T): T =>
  valor && (lista as readonly string[]).includes(valor) ? (valor as T) : padrao;

export function CalculadoraRescisao() {
  const busca = useBuscaInicial();
  return <Formulario key={busca} inicial={new URLSearchParams(busca)} />;
}

function Formulario({ inicial }: { inicial: URLSearchParams }) {
  const hoje = useHoje(dataDaUltimaVerificacao);
  const [motivo, setMotivo] = useState<Motivo>(escolher(MOTIVOS.map((m) => m.valor), inicial.get('motivo'), 'sem-justa-causa'));
  const [salario, setSalario] = useState(inicial.get('salario') ?? '3.000,00');
  const [admissao, setAdmissao] = useState(inicial.get('admissao') ?? '2024-03-10');
  // The end date defaults to today, known only after hydration: null = "not chosen".
  const [saidaEscolhida, setSaida] = useState<string | null>(inicial.get('saida'));
  const saida = saidaEscolhida ?? hoje;
  const [aviso, setAviso] = useState<Aviso>(escolher(['indenizado', 'trabalhado', 'nao-cumprido'] as const, inicial.get('aviso'), 'indenizado'));
  const [vencidas, setVencidas] = useState<Vencidas>(escolher(VENCIDAS, inicial.get('vencidas'), '0'));
  const [dependentes, setDependentes] = useState<Dependentes>(escolher(DEPENDENTES, inicial.get('dependentes'), '0'));
  const [media, setMedia] = useState(inicial.get('media') ?? '');
  const [fgts, setFgts] = useState(inicial.get('fgts') ?? '');
  const [adiantamento, setAdiantamento] = useState(inicial.get('adiantamento') ?? '');
  const [maisOpcoes, setMaisOpcoes] = useState(inicial.has('media') || inicial.has('fgts') || inicial.has('adiantamento'));

  useSincronizarUrl({
    motivo,
    salario,
    admissao,
    saida: saidaEscolhida ?? undefined,
    aviso,
    vencidas,
    dependentes,
    media: media || undefined,
    fgts: fgts || undefined,
    adiantamento: adiantamento || undefined,
  });

  const valorSalario = parseReais(salario);
  const valorMedia = media === '' ? 0 : parseReais(media);
  const valorFgts = fgts === '' ? undefined : parseReais(fgts);
  const valorAdiantamento = adiantamento === '' ? 0 : parseReais(adiantamento);
  const datasValidas = isIsoDate(admissao) && isIsoDate(saida);
  const ordemInvalida = datasValidas && saida < admissao;

  // Notice options depend on who ended the contract.
  const opcoesAviso: { valor: Aviso; rotulo: string }[] =
    motivo === 'pedido-demissao'
      ? [
          { valor: 'trabalhado', rotulo: 'Vou cumprir' },
          { valor: 'nao-cumprido', rotulo: 'Não vou cumprir' },
        ]
      : [
          { valor: 'indenizado', rotulo: 'Indenizado' },
          { valor: 'trabalhado', rotulo: 'Trabalhado' },
        ];
  const avisoEfetivo = opcoesAviso.some((o) => o.valor === aviso) ? aviso : opcoesAviso[0].valor;

  const resultado = useMemo(() => {
    if (valorSalario === null || valorMedia === null || valorFgts === null || valorAdiantamento === null || !datasValidas || ordemInvalida) return null;
    return calcularRescisao(
      {
        salario: valorSalario,
        mediaVariaveis: valorMedia,
        admissao,
        saida,
        motivo,
        aviso: avisoEfetivo,
        feriasVencidas: Number(vencidas),
        adiantamento13: valorAdiantamento,
        saldoFgts: valorFgts,
        dependentes: Number(dependentes),
      },
      saida,
      hoje,
    );
  }, [valorSalario, valorMedia, valorFgts, valorAdiantamento, datasValidas, ordemInvalida, admissao, saida, motivo, avisoEfetivo, vencidas, dependentes, hoje]);

  return (
    <div className="space-y-7">
      <Etapa numero={1} titulo="Seus dados">
        <CartaoCalculadora>
          <div className="space-y-1.5">
            <Segmentado nome="motivo" rotulo="Como foi a saída?" opcoes={MOTIVOS} valor={motivo} onChange={setMotivo} />
            <p className="text-sm text-cinza">{EXPLICACAO[motivo]}</p>
          </div>
          <Campo id="salario" rotulo="Último salário bruto" erro={valorSalario === null ? 'Digite um valor válido, por exemplo 3.000,00' : undefined}>
            <Entrada id="salario" prefixo="R$" inputMode="decimal" autoComplete="off" value={salario} onChange={(e) => setSalario(e.target.value)} invalido={valorSalario === null} />
          </Campo>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo id="admissao" rotulo="Data de admissão">
              <Entrada id="admissao" type="date" value={admissao} onChange={(e) => setAdmissao(e.target.value)} invalido={!isIsoDate(admissao) || ordemInvalida} />
            </Campo>
            <Campo id="saida" rotulo="Último dia de trabalho" erro={ordemInvalida ? 'A saída não pode ser antes da admissão' : undefined}>
              <Entrada id="saida" type="date" value={saida} onChange={(e) => setSaida(e.target.value)} invalido={!isIsoDate(saida) || ordemInvalida} />
            </Campo>
          </div>
          {motivo !== 'justa-causa' && (
            <Segmentado nome="aviso" rotulo="Aviso prévio" opcoes={opcoesAviso} valor={avisoEfetivo} onChange={setAviso} />
          )}
          <Segmentado nome="vencidas" rotulo="Férias vencidas (períodos não tirados)" opcoes={VENCIDAS.map((v) => ({ valor: v, rotulo: v }))} valor={vencidas} onChange={setVencidas} />
          <Segmentado
            nome="dependentes"
            rotulo="Dependentes no Imposto de Renda"
            opcoes={DEPENDENTES.map((d) => ({ valor: d, rotulo: d === '5' ? '5+' : d }))}
            valor={dependentes}
            onChange={setDependentes}
          />
          <button type="button" onClick={() => setMaisOpcoes((v) => !v)} aria-expanded={maisOpcoes} aria-controls="mais-opcoes" className="text-sm font-semibold text-verde-escuro">
            {maisOpcoes ? '− Menos opções' : '+ Saldo do FGTS, horas extras e adiantamento do 13º'}
          </button>
          {maisOpcoes && (
            <div id="mais-opcoes" className="grid gap-3 sm:grid-cols-2">
              <Campo id="fgts" rotulo="Saldo do FGTS" ajuda="No app FGTS. Sem ele, estimamos a multa." erro={valorFgts === null ? 'Valor inválido' : undefined}>
                <Entrada id="fgts" prefixo="R$" inputMode="decimal" placeholder="0,00" value={fgts} onChange={(e) => setFgts(e.target.value)} invalido={valorFgts === null} />
              </Campo>
              <Campo id="media" rotulo="Média de horas extras e comissões" ajuda="Por mês, nos últimos 12 meses." erro={valorMedia === null ? 'Valor inválido' : undefined}>
                <Entrada id="media" prefixo="R$" inputMode="decimal" placeholder="0,00" value={media} onChange={(e) => setMedia(e.target.value)} invalido={valorMedia === null} />
              </Campo>
              <Campo id="adiantamento" rotulo="13º já recebido este ano" ajuda="1ª parcela, se já caiu." erro={valorAdiantamento === null ? 'Valor inválido' : undefined}>
                <Entrada id="adiantamento" prefixo="R$" inputMode="decimal" placeholder="0,00" value={adiantamento} onChange={(e) => setAdiantamento(e.target.value)} invalido={valorAdiantamento === null} />
              </Campo>
            </div>
          )}
        </CartaoCalculadora>
      </Etapa>

      <Etapa numero={2} titulo="Seu resultado">
        {resultado ? (
          <Resultado resultado={resultado} saida={saida} />
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-tinta/40 bg-white p-4 text-sm text-cinza">Corrija os valores acima para ver o resultado.</p>
        )}
      </Etapa>
    </div>
  );
}

function somarDias(d: string, n: number) {
  return new Date(Date.parse(`${d}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}

function Resultado({ resultado: r, saida }: { resultado: ReturnType<typeof calcularRescisao>; saida: string }) {
  const prazo = formatDateBr(somarDias(saida, 10)); // CLT, art. 477, § 6º
  const texto = [
    `Rescisão: ${formatarReais(r.liquido)} líquido`,
    ...r.verbas.map((v) => `${v.rotulo}: ${formatarReais(v.valor)}`),
    ...r.descontos.map((v) => `${v.rotulo}: − ${formatarReais(v.valor)}`),
    r.fgts.multa > 0 ? `Multa do FGTS (${formatarPercentual(r.fgts.multaPercentual)}): ${formatarReais(r.fgts.multa)}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="space-y-4">
      <CartaoResultado
        titulo={`Rescisão · ${r.anosCompletos} ano(s) de casa`}
        anuncio={`Sua rescisão: ${formatarReais(r.liquido)} líquido.`}
        adesivo={{ chave: String(r.liquido) }}
      >
        <ValorDestaque rotulo="Você recebe" valor={r.liquido}>
          <p className="mt-1 text-sm font-semibold">Pagamento até {prazo} (10 dias após a saída)</p>
        </ValorDestaque>
        <dl className="mt-3">
          {r.verbas.map((v) => (
            <LinhaResultado key={v.id} rotulo={v.rotulo} valor={v.valor} detalhe={v.detalhe} />
          ))}
          {r.descontos.map((v) => (
            <LinhaResultado key={v.id} rotulo={v.rotulo} valor={v.valor} negativo detalhe={v.detalhe || undefined} />
          ))}
          <LinhaResultado rotulo="Total bruto" valor={r.totalBruto} />
        </dl>
      </CartaoResultado>

      <section aria-label="FGTS e seguro-desemprego" className="cartao-forte space-y-2 rounded-2xl bg-white p-4 text-[15px]">
        <h3 className="titulo-display text-xl">FGTS e seguro-desemprego</h3>
        {r.fgts.multaPercentual > 0 ? (
          <p>
            <strong>Multa de {formatarPercentual(r.fgts.multaPercentual)} do FGTS: {formatarReais(r.fgts.multa)}</strong>
            {!r.fgts.saldoInformado && ' (estimativa: informe o saldo do FGTS em “mais opções” para o valor exato)'}. É depositada na sua conta do FGTS,
            e você pode sacar {formatarPercentual(r.fgts.saquePercentual)} do saldo.
          </p>
        ) : (
          <p>Neste tipo de saída não há multa do FGTS e o saldo fica na conta (não pode ser sacado agora).</p>
        )}
        <p>
          {r.seguroDesemprego
            ? 'Você pode ter direito ao seguro-desemprego (depende de quantos meses trabalhou antes).'
            : 'Neste tipo de saída não há seguro-desemprego.'}
        </p>
        {r.diasAviso > 30 && <p className="text-sm text-cinza">Aviso prévio de {r.diasAviso} dias: 30 + 3 por ano completo de empresa (Lei 12.506/2011).</p>}
      </section>

      <Compartilhar texto={texto} />
      <AlertasRegras regras={r.regras} />
      <FontesRegras regras={r.regras} />
    </div>
  );
}
