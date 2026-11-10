'use client';

import { useMemo, useState } from 'react';
import { AlertasRegras } from '@/components/calc/alertas-regras';
import { Compartilhar } from '@/components/calc/compartilhar';
import { FontesRegras } from '@/components/calc/fontes-regras';
import { CartaoResultado, LinhaResultado, ValorDestaque } from '@/components/calc/cartao-resultado';
import { Campo, CartaoCalculadora, Entrada } from '@/components/ui/campo';
import { Etapa } from '@/components/ui/etapa';
import { Segmentado } from '@/components/ui/segmentado';
import { formatarPercentual, formatarReais } from '@/lib/calc/dinheiro';
import { calcularSalarioLiquido } from '@/lib/calc/salario-liquido';
import { dataDaUltimaVerificacao } from '@/lib/regras/catalogo';
import { useHoje } from '@/lib/ui/hoje';
import { parseReais } from '@/lib/ui/parse';
import { useBuscaInicial, useSincronizarUrl } from '@/lib/ui/url';

const DEPENDENTES = ['0', '1', '2', '3', '4', '5'] as const;
type Dependentes = (typeof DEPENDENTES)[number];

export function CalculadoraSalarioLiquido() {
  const busca = useBuscaInicial();
  return <Formulario key={busca} inicial={new URLSearchParams(busca)} />;
}

function Formulario({ inicial }: { inicial: URLSearchParams }) {
  const hoje = useHoje(dataDaUltimaVerificacao);
  const depInicial = inicial.get('dependentes');
  const [salario, setSalario] = useState(inicial.get('salario') ?? '3.500,00');
  const [dependentes, setDependentes] = useState<Dependentes>(
    depInicial && (DEPENDENTES as readonly string[]).includes(depInicial) ? (depInicial as Dependentes) : '0',
  );
  const [pensao, setPensao] = useState(inicial.get('pensao') ?? '');
  const [outros, setOutros] = useState(inicial.get('outros') ?? '');
  const [maisOpcoes, setMaisOpcoes] = useState(inicial.has('pensao') || inicial.has('outros'));

  useSincronizarUrl({ salario, dependentes, pensao: pensao || undefined, outros: outros || undefined });

  const valorSalario = parseReais(salario);
  const valorPensao = pensao === '' ? 0 : parseReais(pensao);
  const valorOutros = outros === '' ? 0 : parseReais(outros);

  const resultado = useMemo(() => {
    if (valorSalario === null || valorPensao === null || valorOutros === null) return null;
    return calcularSalarioLiquido(
      { salarioBruto: valorSalario, dependentes: Number(dependentes), pensaoAlimenticia: valorPensao, outrosDescontos: valorOutros },
      hoje,
      hoje,
    );
  }, [valorSalario, valorPensao, valorOutros, dependentes, hoje]);

  return (
    <div className="space-y-7">
      <Etapa numero={1} titulo="Seus dados">
        <CartaoCalculadora>
          <Campo id="salario" rotulo="Salário bruto mensal" erro={valorSalario === null ? 'Digite um valor válido, por exemplo 3.500,00' : undefined}>
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
            {maisOpcoes ? '− Menos opções' : '+ Pensão alimentícia e outros descontos'}
          </button>
          {maisOpcoes && (
            <div id="mais-opcoes" className="grid gap-3 sm:grid-cols-2">
              <Campo id="pensao" rotulo="Pensão alimentícia" ajuda="Deduz do Imposto de Renda." erro={valorPensao === null ? 'Valor inválido' : undefined}>
                <Entrada id="pensao" prefixo="R$" inputMode="decimal" placeholder="0,00" value={pensao} onChange={(e) => setPensao(e.target.value)} invalido={valorPensao === null} />
              </Campo>
              <Campo id="outros" rotulo="Outros descontos" ajuda="Vale-transporte, plano de saúde…" erro={valorOutros === null ? 'Valor inválido' : undefined}>
                <Entrada id="outros" prefixo="R$" inputMode="decimal" placeholder="0,00" value={outros} onChange={(e) => setOutros(e.target.value)} invalido={valorOutros === null} />
              </Campo>
            </div>
          )}
        </CartaoCalculadora>
      </Etapa>

      <Etapa numero={2} titulo="Seu resultado">
        {resultado ? <Resultado resultado={resultado} /> : <p className="rounded-2xl border-2 border-dashed border-tinta/40 bg-white p-4 text-sm text-cinza">Corrija os valores acima para ver o resultado.</p>}
      </Etapa>
    </div>
  );
}

function Resultado({ resultado }: { resultado: ReturnType<typeof calcularSalarioLiquido> }) {
  const { inss, irrf } = resultado;
  const mes = resultado.regras[0].data.slice(5, 7) + '/' + resultado.regras[0].data.slice(0, 4);

  const texto = [
    `Salário líquido: ${formatarReais(resultado.salarioLiquido)}`,
    `Salário bruto: ${formatarReais(resultado.salarioBruto)}`,
    `INSS: ${formatarReais(inss.total)} · Imposto de Renda: ${formatarReais(irrf.imposto)}`,
  ].join('\n');

  return (
    <div className="space-y-4">
      <CartaoResultado
        titulo={`Salário líquido · ${mes}`}
        anuncio={`Seu salário líquido: ${formatarReais(resultado.salarioLiquido)}. INSS ${formatarReais(inss.total)}, Imposto de Renda ${formatarReais(irrf.imposto)}.`}
        adesivo={{ chave: String(resultado.salarioLiquido) }}
      >
        <ValorDestaque rotulo="Você recebe" valor={resultado.salarioLiquido}>
          <p className="mt-1 text-sm font-semibold">INSS + IR = {formatarPercentual(Math.round(resultado.aliquotaEfetiva * 1000) / 1000)} do salário bruto</p>
        </ValorDestaque>
        <dl className="mt-3">
          <LinhaResultado rotulo="Salário bruto" valor={resultado.salarioBruto} />
          <LinhaResultado
            rotulo="INSS"
            valor={inss.total}
            negativo
            detalhe={
              inss.faixas.length > 0 && (
                <>
                  {inss.faixas.map((f) => `${formatarPercentual(f.aliquota)} sobre ${formatarReais(f.base)}`).join(' · ')}
                  {inss.tetoAtingido && ` · teto atingido (${formatarReais(inss.teto)})`}
                </>
              )
            }
          />
          <LinhaResultado
            rotulo="Imposto de Renda"
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
                  {irrf.isentoPelaReducao && <strong className="block text-verde-escuro">Nova lei: isenção para quem ganha até R$ 5.000 ✓</strong>}
                </>
              )
            }
          />
          {resultado.pensaoAlimenticia > 0 && <LinhaResultado rotulo="Pensão alimentícia" valor={resultado.pensaoAlimenticia} negativo />}
          {resultado.outrosDescontos > 0 && <LinhaResultado rotulo="Outros descontos" valor={resultado.outrosDescontos} negativo />}
          <LinhaResultado rotulo="Total de descontos" valor={resultado.totalDescontos} negativo />
        </dl>
      </CartaoResultado>
      <Compartilhar texto={texto} />
      <AlertasRegras regras={resultado.regras} />
      <FontesRegras regras={resultado.regras} />
    </div>
  );
}
