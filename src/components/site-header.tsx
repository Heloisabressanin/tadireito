import Link from 'next/link';
import { Logo } from '@/components/logo';
import { NavPrincipal } from '@/components/navegacao';

export function SiteHeader() {
  return (
    <header className="bg-fundo">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Tá Direito, página inicial">
          <Logo />
        </Link>
        <NavPrincipal />
      </div>
    </header>
  );
}
