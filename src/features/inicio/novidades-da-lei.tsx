'use client';

import Link from 'next/link';
import { formatarReais } from '@/lib/calc/dinheiro';
import { dataDaUltimaVerificacao, regras } from '@/lib/regras/catalogo';
import { resolverRegra } from '@/lib/regras/resolver';
import { useHoje } from '@/lib/ui/hoje';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

type Novidade = { quando: { dia: string; resto: string }; emVigor: boolean; titulo: string; texto: string; href: string; acao: string };

function data(iso: string) {
  const [ano, mes, dia] = iso.split('-');
  return { dia: `${Number(dia)} ${MESES[Number(mes) - 1]}`, resto: ano };
}

/** Three cards built from the rule files: the next scheduled changes, or what is in force once they happened. */
function novidades(hoje: string): Novidade[] {
  const jornada = resolverRegra(regras.jornada, hoje);
  const proximaJornada = jornada.proxima;
  const mei = resolverRegra(regras.meiLimite, hoje);
  const proximoMei = mei.proxima;
  const irrf = resolverRegra(regras.irrf, hoje);

  return [
    proximaJornada
      ? { quando: data(proximaJornada.vigenteDesde), emVigor: false, titulo: `Jornada de ${proximaJornada.valor.horas} horas`, texto: 'Fim da escala 6x1: sua hora extra passa a valer mais.', href: '/hora-extra', acao: 'Calcular minha hora extra' }
      : { quando: data(jornada.versao.vigenteDesde), emVigor: true, titulo: `Jornada de ${jornada.valor.horas} horas`, texto: 'Veja quanto vale sua hora extra hoje.', href: '/hora-extra', acao: 'Calcular minha hora extra' },
    proximoMei
      ? { quando: data(proximoMei.vigenteDesde), emVigor: false, titulo: `Limite do MEI: ${formatarReais(proximoMei.valor.anual)}`, texto: 'A nova lei aumenta o faturamento permitido.', href: '/limite-mei', acao: 'Ver meu limite' }
      : { quando: data(mei.versao.vigenteDesde), emVigor: true, titulo: `Limite do MEI: ${formatarReais(mei.valor.anual)}`, texto: 'Veja quanto você ainda pode faturar este ano.', href: '/limite-mei', acao: 'Ver meu limite' },
    { quando: data(irrf.versao.vigenteDesde), emVigor: true, titulo: `IR zero até ${formatarReais(irrf.valor.reducao.isencaoAte)}`, texto: 'A isenção já vale no seu salário todo mês.', href: '/salario-liquido', acao: 'Calcular meu salário' },
  ];
}

export function NovidadesDaLei() {
  const itens = novidades(useHoje(dataDaUltimaVerificacao));
  return (
    <section aria-labelledby="novidades" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
      <h2 id="novidades" className="titulo-display text-5xl">
        Novidades da lei
      </h2>
      <ul className="mt-6 grid gap-5 sm:grid-cols-3">
        {itens.map((n) => (
          <li key={n.href}>
            <Link href={n.href} className="cartao-forte group flex h-full flex-col rounded-3xl bg-white p-5 transition-transform hover:-translate-y-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className="titulo-display text-3xl">
                  {n.quando.dia} <span className="text-xl text-cinza">{n.quando.resto}</span>
                </span>
                <span className={`rounded-full border-2 border-tinta px-2.5 py-0.5 text-[11px] font-extrabold uppercase ${n.emVigor ? 'bg-verde-claro' : 'bg-amarelo'}`}>
                  {n.emVigor ? 'Em vigor' : 'Em breve'}
                </span>
              </span>
              <span className="mt-3 text-lg font-extrabold">{n.titulo}</span>
              <span className="mt-1 flex-1 text-[15px] text-[#333]">{n.texto}</span>
              <span className="mt-4 font-extrabold text-verde-escuro group-hover:underline">{n.acao} →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
