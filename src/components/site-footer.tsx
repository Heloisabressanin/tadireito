import Link from 'next/link';
import { LogoMark } from '@/components/logo';
import { SeloConferido } from '@/components/marca/selo';
import { dataDaUltimaVerificacao } from '@/lib/regras/catalogo';
import { paginas, paginasInstitucionais, site, tools } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-tinta text-[#d5e2da]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-12 pb-8 text-sm sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div>
          <p className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white">
            <LogoMark className="size-8" />
            <span>
              <span className="text-amarelo">tá</span> direito
            </span>
          </p>
          <p className="mt-3 max-w-xs leading-relaxed">{site.tagline} Calculadoras grátis, com as fontes oficiais ao lado de cada resultado.</p>
          <div className="mt-4">
            <SeloConferido data={dataDaUltimaVerificacao} escuro />
          </div>
        </div>
        <nav aria-label="Calculadoras no rodapé">
          <p className="font-extrabold text-white">Calculadoras</p>
          <ul className="mt-3 space-y-1.5">
            {[...tools, ...paginas].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-amarelo">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Institucional">
          <p className="font-extrabold text-white">Tá Direito</p>
          <ul className="mt-3 space-y-1.5">
            {paginasInstitucionais.map((pagina) => (
              <li key={pagina.href}>
                <Link href={pagina.href} className="hover:text-amarelo">
                  {pagina.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.contato}`} className="hover:text-amarelo">
                Contato
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-[#bdbdbd] sm:px-6">
          © {dataDaUltimaVerificacao.slice(0, 4)} {site.name} · Valores estimados para fins informativos · Não somos o governo.
        </p>
      </div>
    </footer>
  );
}
