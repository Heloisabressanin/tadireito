// Renders the brand images (app icons, Apple icon, social share image) from the logo.
// Usage: node scripts/gerar-imagens.mjs
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const logo = await readFile(new URL('../src/app/icon.svg', import.meta.url), 'utf8');
const dataUri = `data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}`;
const base = `margin:0;display:flex;align-items:center;justify-content:center;font-family:Inter,-apple-system,'Helvetica Neue',Arial,sans-serif;`;

const imagens = [
  // Full-bleed icon (the SVG already has rounded corners).
  { arquivo: 'public/icons/icon-192.png', largura: 192, altura: 192, html: `<body style="${base}"><img src="${dataUri}" width="192" height="192"></body>`, transparente: true },
  { arquivo: 'public/icons/icon-512.png', largura: 512, altura: 512, html: `<body style="${base}"><img src="${dataUri}" width="512" height="512"></body>`, transparente: true },
  // Maskable: Android may crop to a circle, so keep the mark inside the 80% safe zone on a solid background.
  { arquivo: 'public/icons/icon-maskable-512.png', largura: 512, altura: 512, html: `<body style="${base}background:#0E7C4A"><img src="${dataUri}" width="380" height="380"></body>` },
  // iOS applies its own rounded mask: square, no transparency.
  { arquivo: 'src/app/apple-icon.png', largura: 180, altura: 180, html: `<body style="${base}background:#0E7C4A"><img src="${dataUri}" width="180" height="180" style="border-radius:0"></body>` },
  {
    arquivo: 'public/og.png',
    largura: 1200,
    altura: 630,
    // Same identity as the site: green band with the Copacabana waves, Bricolage headline, yellow tag.
    html: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=Inter:wght@600;800&display=block"><body style="${base}background:#0E7C4A;width:1200px;height:630px;position:relative;overflow:hidden;justify-content:flex-start;padding:0 88px;box-sizing:border-box">
      <div style="position:absolute;inset:0;opacity:.16;background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='48' viewBox='0 0 120 48'%3E%3Cpath d='M0 24 C 15 4, 45 4, 60 24 S 105 44, 120 24' fill='none' stroke='%23fff' stroke-width='9'/%3E%3C/svg%3E&quot;);background-size:120px 48px"></div>
      <div style="position:relative;display:flex;flex-direction:column">
        <div style="display:flex;align-items:center;gap:18px"><img src="${dataUri}" width="76" height="76" style="border-radius:20px;box-shadow:0 0 0 5px #FFF8EA"><span style="font-family:Inter;font-size:48px;font-weight:800;letter-spacing:-1.5px;color:#fff"><span style="color:#FFC629">tá</span> direito</span></div>
        <p style="font-family:'Bricolage Grotesque';font-size:116px;font-weight:800;letter-spacing:-4px;color:#fff;margin:30px 0 0;line-height:.95">Seu salário<br><span style="color:#FFC629">tá direito?</span></p>
        <p style="font-family:Inter;font-size:30px;font-weight:600;color:#fff;margin:28px 0 0">Salário líquido · Hora extra · Limite do MEI</p>
      </div>
      <span style="position:absolute;top:76px;right:80px;transform:rotate(8deg);background:#FFC629;border:4px solid #10201A;border-radius:999px;padding:12px 26px;font-family:Inter;font-weight:800;font-size:32px;color:#10201A;box-shadow:5px 5px 0 #10201A">TÁ DIREITO ✓</span>
    </body>`,
  },
];

const browser = await chromium.launch();
for (const { arquivo, largura, altura, html, transparente } of imagens) {
  const page = await browser.newPage({ viewport: { width: largura, height: altura } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: arquivo, omitBackground: !!transparente });
  await page.close();
  console.log(`✓ ${arquivo}`);
}
await browser.close();
