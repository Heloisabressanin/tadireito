'use client';

import { useMemo, useState } from 'react';
import { AlertasRegras } from '@/components/calc/alertas-regras';
import { Compartilhar } from '@/components/calc/compartilhar';
import { FontesRegras } from '@/components/calc/fontes-regras';
import { CartaoResultado, LinhaResultado, ValorAnimado, ValorDestaque } from '@/components/calc/cartao-resultado';
import { Campo, CartaoCalculadora, Entrada } from '@/components/ui/campo';
import { Etapa } from '@/components/ui/etapa';
import { Segmentado } from '@/components/ui/segmentado';
import { arredondar, formatarPercentual, formatarReais } from '@/lib/calc/dinheiro';
import { calcularHoraExtra, type ResultadoHoraExtra } from '@/lib/calc/hora-extra';
import { dataDaUltimaVerificacao } from '@/lib/regras/catalogo';
import { formatDateBr } from '@/lib/regras/dates';
import { useHoje } from '@/lib/ui/hoje';
import { parseHoras, parseInteiro, parseReais } from '@/lib/ui/parse';
import { useBuscaInicial, useSincronizarUrl } from '@/lib/ui/url';

const JORNADAS = ['auto', '44', '42', '40'] as const;
type Jornada = (typeof JORNADAS)[number];

function opcaoValida<T extends string>(opcoes: readonly T[], valor: string | null, padrao: T): T {
  return valor !== null && (opcoes as readonly string[]).includes(valor) ? (valor as T) : padrao;
}

export function CalculadoraHoraExtra() {
  const busca = useBuscaInicial();
  return <Formulario key={busca} inicial={new URLSearchParams(busca)} />;
}

function Formulario({ inicial }: { inicial: URLSearchParams }) {
  const hoje = useHoje(dataDaUltimaVerificacao);
  const [salario, setSalario] = useState(inicial.get('salario') ?? '2.400,00');
  const [horas50, setHoras50] = useState(inicial.get('horas') ?? '10');
  const [adicional, setAdicional] = useState(inicial.get('adicional') ?? '50');
  const [horas100, setHoras100] = useState(inicial.get('horas100') ?? '');
  const [jornada, setJornada] = useState<Jornada>(opcaoValida(JORNADAS, inicial.get('jornada'), 'auto'));
  const [comDsr, setComDsr] = useState(inicial.has('uteis'));
  const [diasUteis, setDiasUteis] = useState(inicial.get('uteis') ?? '');
  const [diasDescanso, setDiasDescanso] = useState(inicial.get('descanso') ?? '');

  useSincronizarUrl({
    salario,
    horas: horas50,
    adicional: adicional === '50' ? undefined : adicional,
    horas100: horas100 || undefined,
    jornada: jornada === 'auto' ? undefined : jornada,
    uteis: comDsr ? diasUteis : undefined,
    descanso: comDsr ? diasDescanso : undefined,
  });

  const valorSalario = parseReais(salario);
  const valorHoras50 = horas50 === '' ? 0 : parseHoras(horas50);
  const valorAdicional = parseInteiro(adicional);
  const adicionalInvalido = valorAdicional === null || valorAdicional < 50;
  const valorHoras100 = horas100 === '' ? 0 : parseHoras(horas100);
  const valorUteis = parseInteiro(diasUteis);
  const valorDescanso = parseInteiro(diasDescanso);
  const dsrInvalido = comDsr && (valorUteis === null || valorUteis === 0 || valorDescanso === null);

  const resultado = useMemo(() => {
    if (valorSalario === null || valorHoras50 === null || valorHoras100 === null || adicionalInvalido || dsrInvalido) return null;
    return calcularHoraExtra(
      {
        salarioBruto: valorSalario,
        horasExtras: [
          { quantidade: valorHoras50, adicional: (valorAdicional as number) / 100 },
          ...(valorHoras100 > 0 ? [{ quantidade: valorHoras100, adicional: 1 }] : []),
        ],
        jornadaSemanal: jornada === 'auto' ? undefined : Number(jornada),
        dsr: comDsr ? { diasUteis: valorUteis as number, diasDeDescanso: valorDescanso as number } : undefined,
      },
      hoje,
      hoje,
    );
  }, [valorSalario, valorHoras50, valorHoras100, valorAdicional, adicionalInvalido, jornada, comDsr, dsrInvalido, valorUteis, valorDescanso, hoje]);

  return (
    <div className="space-y-7">
      <Etapa numero={1} titulo="Seus dados">
        <CartaoCalculadora>
          <Campo id="salario" rotulo="Salário bruto mensal" erro={valorSalario === null ? 'Digite um valor válido, por exemplo 2.400,00' : undefined}>
            <Entrada id="salario" prefixo="R$" inputMode="decimal" autoComplete="off" value={salario} onChange={(e) => setSalario(e.target.value)} invalido={valorSalario === null} />
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo id="horas" rotulo="Horas extras no mês" erro={valorHoras50 === null ? 'Ex.: 10 ou 7,5' : undefined}>
              <Entrada id="horas" inputMode="decimal" sufixo="h" value={horas50} onChange={(e) => setHoras50(e.target.value)} invalido={valorHoras50 === null} />
            </Campo>
            <Campo id="adicional" rotulo="Adicional" ajuda="Mínimo legal: 50%" erro={adicionalInvalido ? 'Mínimo de 50%' : undefined}>
              <Entrada id="adicional" inputMode="numeric" sufixo="%" value={adicional} onChange={(e) => setAdicional(e.target.value)} invalido={adicionalInvalido} />
            </Campo>
          </div>
          <Campo id="horas100" rotulo="Horas a 100% (domingos e feriados)" erro={valorHoras100 === null ? 'Ex.: 4' : undefined}>
            <Entrada id="horas100" inputMode="decimal" sufixo="h" placeholder="0" value={horas100} onChange={(e) => setHoras100(e.target.value)} invalido={valorHoras100 === null} />
          </Campo>
          <Segmentado
            nome="jornada"
            rotulo="Jornada semanal"
            opcoes={[
              { valor: 'auto', rotulo: 'Pela lei' },
              { valor: '44', rotulo: '44h' },
              { valor: '42', rotulo: '42h' },
              { valor: '40', rotulo: '40h' },
            ]}
            valor={jornada}
            onChange={setJornada}
          />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={comDsr} onChange={(e) => setComDsr(e.target.checked)} className="size-5 accent-verde" />
            Incluir o DSR (descanso semanal remunerado)
          </label>
          {comDsr && (
            <div className="grid grid-cols-2 gap-3">
              <Campo id="uteis" rotulo="Dias úteis no mês" erro={valorUteis === null || valorUteis === 0 ? 'Ex.: 22' : undefined}>
                <Entrada id="uteis" inputMode="numeric" value={diasUteis} onChange={(e) => setDiasUteis(e.target.value)} invalido={valorUteis === null || valorUteis === 0} />
              </Campo>
              <Campo id="descanso" rotulo="Domingos, feriados e folgas" erro={valorDescanso === null ? 'Ex.: 8' : undefined}>
                <Entrada id="descanso" inputMode="numeric" value={diasDescanso} onChange={(e) => setDiasDescanso(e.target.value)} invalido={valorDescanso === null} />
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

function Resultado({ resultado }: { resultado: ResultadoHoraExtra }) {
  const { comparativo } = resultado;
  const diferenca = comparativo ? arredondar(comparativo.total - resultado.total) : 0;
  const regras = [resultado.regraJornada, resultado.regraDivisor, ...(comparativo ? [comparativo.regraDivisor] : [])];

  const texto = [
    `Hora extra com jornada de ${resultado.jornadaSemanal}h: ${formatarReais(resultado.total)}`,
    comparativo && `Com jornada de ${comparativo.jornadaSemanal}h (a partir de ${formatDateBr(comparativo.aPartirDe)}): ${formatarReais(comparativo.total)}`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="space-y-5">
      <CartaoResultado
        titulo={`Horas extras · jornada de ${resultado.jornadaSemanal}h`}
        anuncio={`Horas extras com jornada de ${resultado.jornadaSemanal}h: ${formatarReais(resultado.total)}.${
          comparativo ? ` A partir de ${formatDateBr(comparativo.aPartirDe)}, com ${comparativo.jornadaSemanal}h: ${formatarReais(comparativo.total)}.` : ''
        }`}
        adesivo={{ chave: String(resultado.total) }}
      >
        <ValorDestaque rotulo="Você recebe a mais" valor={resultado.total} />
        <dl className="mt-3">
          <LinhaResultado rotulo={`Hora normal (salário ÷ ${resultado.divisor})`} valor={resultado.horaNormal} />
          {resultado.linhas
            .filter((l) => l.quantidade > 0)
            .map((l) => (
              <LinhaResultado
                key={l.adicional}
                rotulo={`${l.quantidade.toLocaleString('pt-BR')}h a ${formatarPercentual(l.adicional)}`}
                valor={l.total}
                detalhe={`${formatarReais(l.valorHora)} por hora extra`}
              />
            ))}
          {resultado.dsr > 0 && <LinhaResultado rotulo="DSR sobre as horas extras" valor={resultado.dsr} />}
        </dl>
      </CartaoResultado>

      {comparativo && (
        <div className="cartao-forte rounded-3xl bg-verde p-5 text-white">
          <p className="text-xs font-extrabold tracking-[0.12em] text-amarelo-palido uppercase">
            A partir de {formatDateBr(comparativo.aPartirDe)} · {comparativo.jornadaSemanal}h
          </p>
          <ValorAnimado valor={comparativo.total} className="titulo-display mt-1 block text-[40px]" />
          <p className="text-sm font-semibold">
            Hora normal {formatarReais(comparativo.horaNormal)} (salário ÷ {comparativo.divisor})
          </p>
          {diferenca > 0 && (
            <p className="mt-3 rounded-2xl border-2 border-tinta bg-amarelo px-3 py-2 text-center text-lg font-extrabold text-tinta">
              + {formatarReais(diferenca)} por mês com o mesmo salário
            </p>
          )}
        </div>
      )}
      <Compartilhar texto={texto} />
      <AlertasRegras regras={regras} />
      <FontesRegras regras={regras} />
    </div>
  );
}
