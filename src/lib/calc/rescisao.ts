import { regras } from '@/lib/regras/catalogo';
import type { IsoDate } from '@/lib/regras/dates';
import { resolverRegra, type RegraResolvida } from '@/lib/regras/resolver';
import { arredondar } from './dinheiro';
import { calcularInss, type ResultadoInss } from './inss';
import { calcularIrrf, type ResultadoIrrf } from './irrf';

export type Motivo = 'sem-justa-causa' | 'pedido-demissao' | 'acordo' | 'justa-causa';
/** indenizado: paid without working · trabalhado: worked · nao-cumprido: the employee resigned and did not work it (may be deducted). */
export type Aviso = 'indenizado' | 'trabalhado' | 'nao-cumprido';

export type EntradaRescisao = {
  salario: number;
  /** Monthly average of variable pay (overtime, commissions…): part of every amount (CLT, art. 487, § 5º). */
  mediaVariaveis?: number;
  admissao: IsoDate;
  /** Last day of the contract (with a worked notice: its last day). */
  saida: IsoDate;
  motivo: Motivo;
  aviso: Aviso;
  /** Complete vacation periods never taken (0, 1 or 2). */
  feriasVencidas: number;
  /** 13º advance already received this year (deducted). */
  adiantamento13?: number;
  /** FGTS balance for termination purposes, if known (CEF statement). */
  saldoFgts?: number;
  dependentes: number;
};

export type Verba = { id: string; rotulo: string; valor: number; detalhe: string };

export type ResultadoRescisao = {
  base: number;
  anosCompletos: number;
  diasAviso: number;
  /** End date including the notice paid without work, which counts as service (CLT, art. 487, § 1º). */
  dataProjetada: IsoDate;
  verbas: Verba[];
  descontos: Verba[];
  inssSalario: ResultadoInss;
  irrfSalario: ResultadoIrrf;
  inss13: ResultadoInss;
  irrf13: ResultadoIrrf;
  totalBruto: number;
  totalDescontos: number;
  liquido: number;
  fgts: {
    depositoRescisao: number;
    multaPercentual: number;
    /** null when the FGTS balance was not given and the employee is entitled to the penalty: we estimate it. */
    saldoInformado: boolean;
    saldoConsiderado: number;
    multa: number;
    saquePercentual: number;
  };
  seguroDesemprego: boolean;
  regras: RegraResolvida<unknown>[];
};

// ---------------------------------------------------------------- dates (UTC, no time zone surprises)

const dia = (d: IsoDate) => new Date(`${d}T12:00:00Z`);
const iso = (d: Date) => d.toISOString().slice(0, 10);
const somarDias = (d: IsoDate, n: number) => iso(new Date(dia(d).getTime() + n * 86_400_000));
const diasNoMes = (ano: number, mes: number) => new Date(Date.UTC(ano, mes, 0)).getUTCDate(); // mes 1-12
const diasEntre = (de: IsoDate, ate: IsoDate) => Math.round((dia(ate).getTime() - dia(de).getTime()) / 86_400_000) + 1; // inclusive

/** Same day N months later; the 31st becomes the last day of a shorter month. */
function somarMeses(d: IsoDate, n: number): IsoDate {
  const [a, m, di] = d.split('-').map(Number);
  const total = a * 12 + (m - 1) + n;
  const ano = Math.floor(total / 12);
  const mes = (total % 12) + 1;
  return `${ano}-${String(mes).padStart(2, '0')}-${String(Math.min(di, diasNoMes(ano, mes))).padStart(2, '0')}`;
}

function anosCompletos(admissao: IsoDate, saida: IsoDate) {
  let anos = 0;
  while (somarMeses(admissao, 12 * (anos + 1)) <= saida) anos++;
  return anos;
}

/** 13º: 1/12 per calendar month with 15 days or more worked (Lei 4.090/1962, art. 1º, § 2º). */
function avos13(inicio: IsoDate, fim: IsoDate) {
  let avos = 0;
  let [a, m] = inicio.split('-').map(Number);
  for (;;) {
    const primeiro = `${a}-${String(m).padStart(2, '0')}-01`;
    if (primeiro > fim) break;
    const ultimo = `${a}-${String(m).padStart(2, '0')}-${diasNoMes(a, m)}`;
    const de = inicio > primeiro ? inicio : primeiro;
    const ate = fim < ultimo ? fim : ultimo;
    if (diasEntre(de, ate) >= 15) avos++;
    m++;
    if (m > 12) {
      m = 1;
      a++;
    }
  }
  return avos;
}

/** Vacation: 1/12 per month of the current accrual period, or a fraction above 14 days (CLT, art. 146). */
function avosFerias(inicioPeriodo: IsoDate, fim: IsoDate) {
  let meses = 0;
  while (meses < 12 && somarMeses(inicioPeriodo, meses + 1) <= somarDias(fim, 1)) meses++;
  if (meses < 12 && diasEntre(somarMeses(inicioPeriodo, meses), fim) > 14) meses++;
  return meses;
}

function diasSaldo(admissao: IsoDate, saida: IsoDate) {
  const [a, m, d] = saida.split('-').map(Number);
  const inicioMes = `${a}-${String(m).padStart(2, '0')}-01`;
  const dias = admissao > inicioMes ? diasEntre(admissao, saida) : d === diasNoMes(a, m) ? 30 : d;
  return Math.min(dias, 30); // commercial month: 30 days
}

// ---------------------------------------------------------------- calculation

export function calcularRescisao(e: EntradaRescisao, data: IsoDate = e.saida, hoje: IsoDate = data): ResultadoRescisao {
  const { salario, mediaVariaveis = 0, admissao, saida, motivo, feriasVencidas, adiantamento13 = 0, dependentes } = e;
  if (!(salario >= 0) || !(mediaVariaveis >= 0) || !(adiantamento13 >= 0)) throw new Error('Amounts must be non-negative numbers');
  if (saida < admissao) throw new Error('The end date must not be before the start date');
  if (!Number.isInteger(feriasVencidas) || feriasVencidas < 0 || feriasVencidas > 2) throw new Error('Expired vacation periods: 0, 1 or 2');
  // Justa causa has no notice; a resignation notice is owed by the employee, never "indenizado" by the employer.
  const aviso: Aviso = motivo === 'justa-causa' ? 'trabalhado' : motivo === 'pedido-demissao' && e.aviso === 'indenizado' ? 'trabalhado' : e.aviso;

  const regraR = resolverRegra(regras.rescisao, data, hoje);
  const regraInss = resolverRegra(regras.inss, data, hoje);
  const regraIrrf = resolverRegra(regras.irrf, data, hoje);
  const regra13 = resolverRegra(regras.decimoTerceiroIrrf, data, hoje);
  const r = regraR.valor;

  const base = arredondar(salario + mediaVariaveis);
  const diaria = base / 30;
  const anos = anosCompletos(admissao, saida);

  // Notice period: 30 days + 3 per full year when the employer ends the contract (Lei 12.506/2011);
  // the proportional extra only benefits the employee, so a resignation notice stays at 30 days.
  const diasAviso =
    motivo === 'justa-causa' ? 0 : motivo === 'pedido-demissao' ? r.avisoDiasBase : Math.min(r.avisoDiasBase + r.avisoDiasPorAno * anos, r.avisoDiasMaximo);
  let diasIndenizados = 0;
  let valorAviso = 0;
  if (motivo === 'sem-justa-causa' || motivo === 'acordo') {
    // Worked notice: 30 days worked, the proportional extra days are paid (MTE, Nota Técnica 184/2012).
    const dias = aviso === 'indenizado' ? diasAviso : Math.max(0, diasAviso - r.avisoDiasBase);
    const fator = motivo === 'acordo' ? 0.5 : 1; // CLT, art. 484-A, I, a
    diasIndenizados = Math.round(dias * fator);
    valorAviso = arredondar(diaria * dias * fator);
  }
  const dataProjetada = somarDias(saida, diasIndenizados);

  const verbas: Verba[] = [];
  const descontos: Verba[] = [];
  const dSaldo = diasSaldo(admissao, saida);
  const saldoSalario = arredondar(diaria * dSaldo);
  verbas.push({ id: 'saldo', rotulo: 'Saldo de salário', valor: saldoSalario, detalhe: `${dSaldo} dia(s) trabalhado(s) no mês` });
  if (valorAviso > 0) {
    verbas.push({
      id: 'aviso',
      rotulo: 'Aviso prévio indenizado',
      valor: valorAviso,
      detalhe: motivo === 'acordo' ? `Metade de ${diasAviso} dias (acordo)` : aviso === 'indenizado' ? `${diasAviso} dias (30 + 3 por ano completo)` : `${diasAviso - 30} dia(s) além dos 30 trabalhados`,
    });
  }

  // 13º proporcional: not due on justa causa (Lei 4.090/1962, art. 3º).
  const ano = Number(dataProjetada.slice(0, 4));
  const inicioAno = `${saida.slice(0, 4)}-01-01`;
  const av13 = motivo === 'justa-causa' ? 0 : avos13(admissao > inicioAno ? admissao : inicioAno, dataProjetada);
  const valor13 = arredondar((base * av13) / 12);
  if (av13 > 0) verbas.push({ id: '13', rotulo: '13º salário proporcional', valor: valor13, detalhe: `${av13}/12 avos${ano > Number(saida.slice(0, 4)) ? ' (inclui o ano seguinte, pelo aviso)' : ''}` });

  // Vacation: expired periods always; the incomplete period except on justa causa (CLT, art. 146; Súmulas 171 and 261 do TST).
  if (feriasVencidas > 0) {
    const v = arredondar(base * feriasVencidas);
    verbas.push({ id: 'ferias-vencidas', rotulo: 'Férias vencidas', valor: v, detalhe: `${feriasVencidas} período(s) não tirado(s)` });
    verbas.push({ id: 'terco-vencidas', rotulo: '1/3 sobre férias vencidas', valor: arredondar(v / 3), detalhe: 'Constituição, art. 7º, XVII' });
  }
  const inicioPeriodo = somarMeses(admissao, 12 * anos);
  const avFerias = motivo === 'justa-causa' ? 0 : avosFerias(inicioPeriodo, dataProjetada);
  if (avFerias > 0) {
    const v = arredondar((base * avFerias) / 12);
    verbas.push({ id: 'ferias-proporcionais', rotulo: 'Férias proporcionais', valor: v, detalhe: `${avFerias}/12 avos do período atual` });
    verbas.push({ id: 'terco-proporcionais', rotulo: '1/3 sobre férias proporcionais', valor: arredondar(v / 3), detalhe: 'Constituição, art. 7º, XVII' });
  }

  // Deductions. INSS and income tax only on the salary balance and on the 13º (each computed on its own);
  // indemnified notice and vacation are exempt from both.
  const inssSalario = calcularInss(saldoSalario, regraInss.valor);
  const irrfSalario = calcularIrrf({ rendimentoTributavel: saldoSalario, inss: inssSalario.total, dependentes }, regraIrrf.valor);
  const inss13 = calcularInss(valor13, regraInss.valor);
  const tabela13 = regra13.valor.descontoSimplificado ? regraIrrf.valor : { ...regraIrrf.valor, descontoSimplificado: 0 };
  const irrf13 = calcularIrrf({ rendimentoTributavel: valor13, inss: inss13.total, dependentes }, tabela13);
  if (inssSalario.total > 0) descontos.push({ id: 'inss', rotulo: 'INSS sobre o saldo de salário', valor: inssSalario.total, detalhe: '' });
  if (irrfSalario.imposto > 0) descontos.push({ id: 'irrf', rotulo: 'IR sobre o saldo de salário', valor: irrfSalario.imposto, detalhe: '' });
  if (inss13.total > 0) descontos.push({ id: 'inss13', rotulo: 'INSS sobre o 13º', valor: inss13.total, detalhe: '' });
  if (irrf13.imposto > 0) descontos.push({ id: 'irrf13', rotulo: 'IR sobre o 13º', valor: irrf13.imposto, detalhe: '' });
  if (adiantamento13 > 0) descontos.push({ id: 'adiantamento13', rotulo: 'Adiantamento do 13º já recebido', valor: arredondar(adiantamento13), detalhe: '' });
  if (motivo === 'pedido-demissao' && aviso === 'nao-cumprido') {
    // CLT, art. 487, § 2º: the employer may deduct the notice the employee did not work.
    descontos.push({ id: 'aviso-nao-cumprido', rotulo: 'Aviso prévio não cumprido', valor: arredondar(diaria * 30), detalhe: 'A empresa pode descontar 30 dias (CLT, art. 487, § 2º)' });
  }

  const totalBruto = arredondar(verbas.reduce((s, v) => s + v.valor, 0));
  const totalDescontos = arredondar(descontos.reduce((s, v) => s + v.valor, 0));

  // FGTS: 8% on salary balance, indemnified notice and 13º (not on indemnified vacation); penalty on the whole balance.
  const depositoRescisao = arredondar((saldoSalario + valorAviso + valor13) * r.depositoFgts);
  const multaPercentual = motivo === 'sem-justa-causa' ? r.multaFgtsSemJustaCausa : motivo === 'acordo' ? r.multaFgtsAcordo : 0;
  const saldoInformado = e.saldoFgts !== undefined && e.saldoFgts >= 0;
  // Without the statement: 8% of the salary per month of contract, plus the 13º and the vacation third each year (rough).
  const meses = Math.max(1, Math.round(diasEntre(admissao, saida) / 30.44));
  const saldoEstimado = arredondar(base * r.depositoFgts * meses * (13 + 1 / 3) / 12);
  const saldoConsiderado = arredondar((saldoInformado ? (e.saldoFgts as number) : saldoEstimado) + depositoRescisao);
  const multa = arredondar(saldoConsiderado * multaPercentual);
  const saquePercentual = motivo === 'sem-justa-causa' ? 1 : motivo === 'acordo' ? r.saqueFgtsAcordo : 0;

  return {
    base,
    anosCompletos: anos,
    diasAviso,
    dataProjetada,
    verbas,
    descontos,
    inssSalario,
    irrfSalario,
    inss13,
    irrf13,
    totalBruto,
    totalDescontos,
    liquido: arredondar(totalBruto - totalDescontos),
    fgts: { depositoRescisao, multaPercentual, saldoInformado, saldoConsiderado, multa, saquePercentual },
    seguroDesemprego: motivo === 'sem-justa-causa', // CLT, art. 484-A, § 2º: not on an agreement
    regras: [regraR, regraInss, regraIrrf],
  };
}
