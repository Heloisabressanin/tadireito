import Link from 'next/link';
import type { ReactNode } from 'react';
import { DadosEstruturados } from '@/components/dados-estruturados';
import { FaixaOndas } from '@/components/marca/faixa';
import { site, tools } from '@/lib/site';

type PaginaFerramentaProps = {
  caminho: string;
  /** Short context line above the title (e.g. "Tabelas oficiais de 2026"). */
  chamada: string;
  titulo: string;
  subtitulo: string;
  calculadora: ReactNode;
  children: ReactNode;
};

/** "Início › Calculadoras › Salário líquido", visible and as structured data for Google. */
function Trilha({ caminho, titulo }: { caminho: string; titulo: string }) {
  return (
    <>
      <nav aria-label="Você está em" className="text-sm font-semibold">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="underline underline-offset-2">
              Início
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>Calculadoras</li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="font-extrabold">
            {titulo}
          </li>
        </ol>
      </nav>
      <DadosEstruturados
        dados={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Início', item: site.url },
              { '@type': 'ListItem', position: 2, name: titulo, item: `${site.url}${caminho}` },
            ],
          },
        ]}
      />
    </>
  );
}

/** Tool page: compact poster header with breadcrumb, calculator first, explanations below (mobile) or beside (desktop). */
export function PaginaFerramenta({ caminho, chamada, titulo, subtitulo, calculadora, children }: PaginaFerramentaProps) {
  const nome = tools.find((t) => t.href === caminho)?.label ?? titulo;
  return (
    <>
      <FaixaOndas>
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-20 sm:px-6 lg:pb-24">
          <Trilha caminho={caminho} titulo={nome} />
          <p className="mt-5 text-xs font-extrabold tracking-[0.14em] text-amarelo-palido uppercase">{chamada}</p>
          <h1 id="titulo-ferramenta" className="titulo-display mt-1.5 max-w-3xl text-[40px] text-balance sm:text-6xl">
            {titulo}
          </h1>
          <p className="mt-2.5 max-w-xl text-[17px] font-semibold">{subtitulo}</p>
        </div>
      </FaixaOndas>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[460px_1fr]">
        <div className="relative z-10 -mt-14 lg:-mt-16">{calculadora}</div>
        <article className="conteudo space-y-4 lg:pt-6" aria-label="Entenda o cálculo">
          {children}
          <h2>Outras calculadoras</h2>
          <ul className="grid list-none gap-3 pl-0 sm:grid-cols-2">
            {tools
              .filter((t) => t.href !== caminho)
              .map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="cartao-forte block rounded-2xl bg-white px-4 py-3 font-extrabold text-tinta transition-transform hover:-translate-y-0.5">
                    {t.label} <span className="font-normal text-cinza">· {t.summary}</span>
                    <span aria-hidden="true" className="float-right">
                      →
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </article>
      </div>
    </>
  );
}

/** Highlighted note with a brand icon. */
export function Destaque({ icone, titulo, children }: { icone?: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border-2 border-tinta bg-amarelo-claro p-4 text-[15px] leading-relaxed">
      {icone && <span className="shrink-0 text-tinta">{icone}</span>}
      <div>
        <strong className="block text-lg font-extrabold">{titulo}</strong>
        {children}
      </div>
    </div>
  );
}

export type Pergunta = { pergunta: string; resposta: string };

export function Perguntas({ perguntas }: { perguntas: Pergunta[] }) {
  return (
    <div className="space-y-2.5">
      {perguntas.map((p) => (
        <details key={p.pergunta} className="group rounded-2xl border-2 border-tinta bg-white px-4 py-3">
          <summary className="flex cursor-pointer list-none justify-between gap-4 font-extrabold">
            {p.pergunta}
            <span aria-hidden="true" className="text-xl leading-none transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="mt-2 text-[15px] leading-relaxed text-[#333]">{p.resposta}</div>
        </details>
      ))}
    </div>
  );
}
