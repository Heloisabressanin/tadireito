import Link from 'next/link';
import type { ReactNode } from 'react';
import { LogoMark } from '@/components/logo';
import { Adesivo, FaixaOndas } from '@/components/marca/faixa';
import {
  IconeCalendario,
  IconeConversa,
  IconeDocumento,
  IconeGrafico,
  IconeLei,
  IconeRelogio,
  IconeSalario,
  IconeSino,
} from '@/components/marca/icones';
import { CalculadoraRapida } from '@/features/inicio/calculadora-rapida';
import { NovidadesDaLei } from '@/features/inicio/novidades-da-lei';
import { dataDaUltimaVerificacao } from '@/lib/regras/catalogo';
import { formatDateBr } from '@/lib/regras/dates';

const FERRAMENTAS: { href: string; titulo: string; texto: string; icone: ReactNode; selo?: string }[] = [
  { href: '/salario-liquido', titulo: 'Salário líquido', texto: 'Com a isenção do IR até R$ 5 mil.', icone: <IconeSalario /> },
  { href: '/hora-extra', titulo: 'Hora extra', texto: 'Acabou a 6x1: sua hora vale mais.', icone: <IconeRelogio />, selo: 'Novo 42h' },
  { href: '/limite-mei', titulo: 'Limite do MEI', texto: 'Sobe pra R$ 110 mil em 2027.', icone: <IconeGrafico />, selo: 'Lei nova' },
];

/** Upcoming features, announced honestly (no date promised). */
const EM_BREVE: { titulo: string; texto: string; icone: ReactNode }[] = [
  { titulo: 'Recibo e orçamento em PDF', texto: 'Pronto em 30 segundos, com o valor por extenso, para enviar no WhatsApp.', icone: <IconeDocumento /> },
  { titulo: 'Rescisão, férias e 13º', texto: 'Todos os tipos de saída e os valores proporcionais, com a lei em dia.', icone: <IconeCalendario /> },
  { titulo: 'Lembrete do DAS', texto: 'Aviso antes do dia 20 e acompanhamento do limite do MEI, mês a mês.', icone: <IconeSino /> },
  { titulo: 'Pergunte em português', texto: 'Escreva sua dúvida do seu jeito e receba o cálculo explicado.', icone: <IconeConversa /> },
];

const GARANTIAS = [
  { icone: <IconeLei />, titulo: 'Fontes oficiais', texto: 'Cada valor vem da Receita Federal, do INSS ou do Diário Oficial, com o link ao lado do resultado.' },
  { icone: <IconeCalendario />, titulo: 'Muda sozinho na data da lei', texto: 'Quando uma lei já publicada muda um valor, a calculadora troca automaticamente no dia certo.' },
  { icone: <IconeDocumento />, titulo: 'Testado com exemplos oficiais', texto: 'Os cálculos batem, centavo por centavo, com os exemplos publicados pela Receita Federal.' },
];

export default function HomePage() {
  return (
    <>
      <FaixaOndas>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-14 lg:pb-20">
          <div>
            <Adesivo cor="vidro">✓ Verificado com a lei em {formatDateBr(dataDaUltimaVerificacao)}</Adesivo>
            <h1 className="titulo-display mt-5 text-[48px] sm:text-7xl">
              Seu salário <span className="block text-amarelo">tá direito?</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed font-medium">
              Salário, hora extra e MEI calculados com a lei de hoje. Grátis, sem cadastro, em 10 segundos.
            </p>
          </div>
          <div className="lg:rotate-1">
            <CalculadoraRapida />
          </div>
        </div>
      </FaixaOndas>

      <section aria-labelledby="ferramentas" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <h2 id="ferramentas" className="titulo-display text-4xl sm:text-5xl">
          Faça a conta certa
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {FERRAMENTAS.map((f) => (
            <li key={f.href}>
              <Link
                href={f.href}
                className="cartao-forte relative flex h-full min-h-48 flex-col justify-between rounded-3xl bg-white p-5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                {f.selo && <Adesivo className="absolute top-4 right-4 rotate-3">{f.selo}</Adesivo>}
                <span>
                  {f.icone}
                  <span className="titulo-display mt-3 block text-3xl">{f.titulo}</span>
                  <span className="mt-1.5 block text-cinza">{f.texto}</span>
                </span>
                <span aria-hidden="true" className="self-end text-2xl font-extrabold">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <NovidadesDaLei />

      <section aria-labelledby="em-breve" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="em-breve" className="titulo-display text-4xl sm:text-5xl">
              Vem aí no Tá Direito
            </h2>
            <p className="mt-2 max-w-xl text-cinza">Novas ferramentas para quem é CLT e para quem trabalha por conta própria.</p>
          </div>
          <Adesivo>Em breve</Adesivo>
        </div>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EM_BREVE.map((f) => (
            <li key={f.titulo} className="rounded-3xl border-2 border-dashed border-tinta/40 bg-papel p-5">
              {f.icone}
              <p className="mt-3 text-lg font-extrabold">{f.titulo}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-[#3e4b44]">{f.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="garantias" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <h2 id="garantias" className="titulo-display text-4xl sm:text-5xl">
          Por que dá para confiar
        </h2>
        <ul className="mt-6 grid gap-5 sm:grid-cols-3">
          {GARANTIAS.map((g) => (
            <li key={g.titulo} className="rounded-3xl border-2 border-tinta bg-white p-5">
              {g.icone}
              <p className="mt-3 text-xl font-extrabold">{g.titulo}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-[#3e4b44]">{g.texto}</p>
            </li>
          ))}
        </ul>
        <Link href="/sobre" className="mt-4 inline-block font-bold text-verde-escuro underline underline-offset-2">
          Como verificamos cada valor →
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <Link href="/app" className="cartao-forte flex items-center gap-4 rounded-3xl bg-tinta p-5 text-white hover:bg-[#1c3328] sm:max-w-2xl">
          <LogoMark className="size-14 shrink-0" />
          <span>
            <strong className="block text-xl font-extrabold">Instale o Tá Direito no celular</strong>
            <span className="text-sm text-[#cfe0d6]">Grátis, sem loja de apps, em 10 segundos</span>
          </span>
          <span className="ml-auto shrink-0 rounded-2xl bg-amarelo px-4 py-2 font-extrabold text-tinta">Baixar</span>
        </Link>
      </section>

      <p className="titulo-display mx-auto max-w-6xl px-4 pt-20 text-center text-4xl sm:px-6 sm:text-6xl">
        Tá certo? <span className="text-verde">Tá direito.</span>
      </p>
      <p className="mt-3 text-center font-semibold text-cinza">Cada valor com a fonte oficial do governo ao lado.</p>
    </>
  );
}
