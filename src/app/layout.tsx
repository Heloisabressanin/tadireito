import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inter } from 'next/font/google';
import { Estatisticas } from '@/components/estatisticas';
import { SiteFooter } from '@/components/site-footer';
import { NavInferior } from '@/components/navegacao';
import { SiteHeader } from '@/components/site-header';
import { site } from '@/lib/site';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

/** Display font for headlines and key amounts (Calçadão direction). */
const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['600', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: site.name,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    images: [site.imagemCompartilhamento],
  },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#0e7c4a',
  // Lets env(safe-area-inset-bottom) work on iPhones, so the bottom tab bar clears the home indicator.
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${bricolage.variable} h-full antialiased`}>
      {/* Bottom padding on mobile so the fixed tab bar never hides the end of the page. */}
      <body className="flex min-h-full flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] font-sans md:pb-0">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <NavInferior />
        {/* The analytics script is served by Vercel only, so skip it in local and test builds. */}
        {process.env.VERCEL && <Estatisticas />}
      </body>
    </html>
  );
}
