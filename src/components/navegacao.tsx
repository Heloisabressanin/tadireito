'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { IconeCasa, IconeCelular, IconeGrafico, IconeRelogio, IconeSalario } from '@/components/marca/icones';
import { paginas, tools } from '@/lib/site';

function estaAtivo(caminhoAtual: string, href: string) {
  return href === '/' ? caminhoAtual === '/' : caminhoAtual.startsWith(href);
}

const LINKS_TOPO = [...tools, paginas[1]];

/** Desktop header links, with the current page highlighted. */
export function NavPrincipal() {
  const caminho = usePathname();
  return (
    <nav aria-label="Principal" className="hidden items-center gap-1 text-[15px] font-bold md:flex">
      {LINKS_TOPO.map((link) => {
        const ativo = estaAtivo(caminho, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={ativo ? 'page' : undefined}
            className={`rounded-full px-3 py-1.5 ${ativo ? 'bg-amarelo' : 'hover:bg-amarelo-claro'}`}
          >
            {link.label}
          </Link>
        );
      })}
      <Link href="/app" className="ml-3 rounded-full bg-tinta px-4 py-2 text-sm font-extrabold text-white hover:bg-verde">
        Baixar o app
      </Link>
    </nav>
  );
}

const ABAS: { href: string; rotulo: string; icone: ReactNode }[] = [
  { href: '/', rotulo: 'Início', icone: <IconeCasa className="size-6" /> },
  { href: '/salario-liquido', rotulo: 'Salário', icone: <IconeSalario className="size-6" /> },
  { href: '/hora-extra', rotulo: 'Hora extra', icone: <IconeRelogio className="size-6" /> },
  { href: '/limite-mei', rotulo: 'MEI', icone: <IconeGrafico className="size-6" /> },
  { href: '/app', rotulo: 'App', icone: <IconeCelular className="size-6" /> },
];

/** Mobile bottom tab bar, like a native app: always visible, one tap to any tool. */
export function NavInferior() {
  const caminho = usePathname();
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-tinta bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {ABAS.map((aba) => {
          const ativo = estaAtivo(caminho, aba.href);
          return (
            <li key={aba.href}>
              <Link
                href={aba.href}
                aria-current={ativo ? 'page' : undefined}
                className="flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] font-extrabold"
              >
                <span className={`flex h-8 w-12 items-center justify-center rounded-full ${ativo ? 'bg-tinta' : ''}`}>{aba.icone}</span>
                {aba.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
