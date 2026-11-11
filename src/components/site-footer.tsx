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
          <a
            href={site.redes.tiktok.url}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-2 font-bold text-white hover:border-amarelo hover:text-amarelo"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
              <path d="M16.6 3c.3 2.2 1.7 3.7 3.9 3.9v3.1c-1.4 0-2.7-.4-3.9-1.1v6.2c0 3.2-2.6 5.6-5.7 5.6S5.2 18.3 5.2 15.2s2.6-5.6 5.7-5.6c.3 0 .6 0 .9.1v3.2a2.6 2.6 0 0 0-.9-.2 2.5 2.5 0 1 0 2.5 2.5V3h3.2Z" />
            </svg>
            <span>
              Siga no TikTok <span className="font-semibold text-[#d5e2da]">{site.redes.tiktok.usuario}</span>
            </span>
          </a>
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
