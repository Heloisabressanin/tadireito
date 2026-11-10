'use client';

import { useMemo, useState } from 'react';
import { AlertasRegras } from '@/components/calc/alertas-regras';
import { CartaoResultado, LinhaResultado, ValorDestaque } from '@/components/calc/cartao-resultado';
import { Compartilhar } from '@/components/calc/compartilhar';
import { FontesRegras } from '@/components/calc/fontes-regras';
import { Campo, CartaoCalculadora, Entrada } from '@/components/ui/campo';
import { Etapa } from '@/components/ui/etapa';
import { Segmentado } from '@/components/ui/segmentado';
import { calcularDecimoTerceiro, type Prazo } from '@/lib/calc/decimo-terceiro';
import { formatarPercentual, formatarReais } from '@/lib/calc/dinheiro';
import { dataDaUltimaVerificacao } from '@/lib/regras/catalogo';
import { formatDateBr } from '@/lib/regras/dates';
import { useHoje } from '@/lib/ui/hoje';
import { parseInteiro, parseReais } from '@/lib/ui/parse';
import { useBuscaInicial, useSincronizarUrl } from '@/lib/ui/url';

const DEPENDENTES = ['0', '1', '2', '3', '4', '5'] as const;
type Dependentes = (typeof DEPENDENTES)[number];

export function CalculadoraDecimoTerceiro() {
  const busca = useBuscaInicial();
  return <Formulario key={busca} inicial={new URLSearchParams(busca)} />;
}

function Formulario({ inicial }: { inicial: URLSearchParams }) {
  const hoje = useHoje(dataDaUltimaVerificacao);
  const ano = hoje.slice(0, 4);
  const depInicial = inicial.get('dependentes');
  const [salario, setSalario] = useState(inicial.get('salario') ?? '3.000,00');
  const [meses, setMeses] = useState(inicial.get('meses') ?? '12');
  const [media, setMedia] = useState(inicial.get('media') ?? '');
  const [dependentes, setDependentes] = useState<Dependentes>(
    depInicial && (DEPENDENTES as readonly string[]).includes(depInicial) ? (depInicial as Dependentes) : '0',
  );
  const [maisOpcoes, setMaisOpcoes] = useState(inicial.has('media'));

  useSincronizarUrl({ salario, meses, media: media || undefined, dependentes });

  const valorSalario = parseReais(salario);
  const valorMeses = parseInteiro(meses);
  const mesesInvalidos = valorMeses === null || valorMeses < 1 || valorMeses > 12;
  const valorMedia = media === '' ? 0 : parseReais(media);

  const resultado = useMemo(() => {
    if (valorSalario === null || mesesInvalidos || valorMedia === null || valorMeses === null) return null;
    return calcularDecimoTerceiro({ salarioBruto: valorSalario, mediaVariaveis: valorMedia, meses: valorMeses, dependentes: Number(dependentes) }, hoje, hoje);
  }, [valorSalario, valorMeses, mesesInvalidos, valorMedia, dependentes, hoje]);

  return (
    <div className="space-y-7">
      <Etapa numero={1} titulo="Seus dados">
        <CartaoCalculadora>
          <Campo id="salario" rotulo="Salário bruto mensal" erro={valorSalario === null ? 'Digite um valor válido, por exemplo 3.000,00' : undefined}>
            <Entrada
              id="salario"
              prefixo="R$"
              inputMode="decimal"
              autoComplete="off"
              value={salario}
              onChange={(e) => setSalario(e.target.value)}
              invalido={valorSalario === null}
              aria-describedby={valorSalario === null ? 'salario-erro' : undefined}
            />
          </Campo>
          <Campo
            id="meses"
            rotulo={`Meses trabalhados em ${ano}`}
            ajuda="Mês com 15 dias ou mais de trabalho conta como mês inteiro."
            erro={mesesInvalidos ? 'De 1 a 12 meses' : undefined}
          >
            <Entrada id="meses" sufixo="meses" inputMode="numeric" value={meses} onChange={(e) => setMeses(e.target.value)} invalido={mesesInvalidos} />
          </Campo>
          <Segmentado
            nome="dependentes"
            rotulo="Dependentes no Imposto de Renda"
            opcoes={DEPENDENTES.map((d) => ({ valor: d, rotulo: d === '5' ? '5+' : d }))}
            valor={dependentes}
            onChange={setDependentes}
          />
          <button
            type="button"
            onClick={() => setMaisOpcoes((v) => !v)}
            aria-expanded={maisOpcoes}
            aria-controls="mais-opcoes"
            className="text-sm font-semibold text-verde-escuro"
          >
            {maisOpcoes ? '− Menos opções' : '+ Horas extras, comissões e adicionais'}
          </button>
          {maisOpcoes && (
            <div id="mais-opcoes">
              <Campo id="media" rotulo="Média mensal de horas extras e comissões" ajuda="Some o que recebeu de variável no ano e divida pelos meses." erro={valorMedia === null ? 'Valor inválido' : undefined}>
                <Entrada id="media" prefixo="R$" inputMode="decimal" placeholder="0,00" value={media} onChange={(e) => setMedia(e.target.value)} invalido={valorMedia === null} />
              </Campo>
            </div>
          )}
        </CartaoCalculadora>
      </Etapa>

      <Etapa numero={2} titulo="Seu resultado">
        {resultado ? (
          <Resultado resultado={resultado} />
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-tinta/40 bg-white p-4 text-sm text-cinza">Corrija os valores acima para ver o resultado.</p>
        )}
      </Etapa>
    </div>
  );
}

function quando(p: Prazo) {
  return p.antecipadoPara
    ? `até ${formatDateBr(p.antecipadoPara)} (o dia ${formatDateBr(p.data).slice(0, 5)} cai no fim de semana)`
    : `até ${formatDateBr(p.data)}`;
}

function Resultado({ resultado }: { resultado: ReturnType<typeof calcularDecimoTerceiro> }) {
  const { inss, irrf, prazos } = resultado;
  const texto = [
    `13º salário: ${formatarReais(resultado.liquido)} líquido`,
    `1ª parcela ${quando(prazos.primeira)}: ${formatarReais(resultado.primeiraParcela)}`,
    `2ª parcela ${quando(prazos.segunda)}: ${formatarReais(resultado.segundaParcela)}`,
  ].join('\n');

  return (
    <div className="space-y-4">
      <CartaoResultado
        titulo={`13º salário · ${resultado.meses}/12 avos`}
        anuncio={`Seu 13º: ${formatarReais(resultado.liquido)} líquido. Primeira parcela ${formatarReais(resultado.primeiraParcela)}, segunda parcela ${formatarReais(resultado.segundaParcela)}.`}
        adesivo={{ chave: String(resultado.liquido) }}
      >
        <ValorDestaque rotulo="Você recebe no total" valor={resultado.liquido}>
          <p className="mt-1 text-sm font-semibold">13º bruto de {formatarReais(resultado.bruto)}, em duas parcelas</p>
        </ValorDestaque>
        <dl className="mt-3">
          <LinhaResultado
            rotulo="1ª parcela"
            valor={resultado.primeiraParcela}
            detalhe={<>Paga {quando(prazos.primeira)}. Metade do 13º, sem desconto de INSS nem de IR.</>}
          />
          <LinhaResultado
            rotulo="2ª parcela"
            valor={resultado.segundaParcela}
            detalhe={<>Paga {quando(prazos.segunda)}. É o restante do 13º, menos o INSS e o IR do 13º inteiro.</>}
          />
          <LinhaResultado
            rotulo="INSS do 13º"
            valor={inss.total}
            negativo
            detalhe={inss.faixas.length > 0 && inss.faixas.map((f) => `${formatarPercentual(f.aliquota)} sobre ${formatarReais(f.base)}`).join(' · ')}
          />
          <LinhaResultado
            rotulo="Imposto de Renda do 13º"
            valor={irrf.imposto}
            negativo
            texto={irrf.imposto === 0 ? 'ISENTO' : undefined}
            detalhe={
              irrf.impostoTabela === 0 ? (
                'Base de cálculo na faixa isenta.'
              ) : (
                <>
                  Base {formatarReais(irrf.base)} ({irrf.metodo === 'simplificado' ? 'desconto simplificado' : 'deduções legais'}) · alíquota{' '}
                  {formatarPercentual(irrf.aliquota)} · imposto {formatarReais(irrf.impostoTabela)}
                  {irrf.reducao > 0 && <> − redução da nova lei {formatarReais(irrf.reducao)}</>}
                  {irrf.isentoPelaReducao && <strong className="block text-verde-escuro">Nova lei: 13º sem IR para quem ganha até R$ 5.000 ✓</strong>}
                </>
              )
            }
          />
        </dl>
      </CartaoResultado>
      <Compartilhar texto={texto} />
      <AlertasRegras regras={resultado.regras} />
      <FontesRegras regras={resultado.regras} />
    </div>
  );
}
