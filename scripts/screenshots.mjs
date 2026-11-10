// Captures mobile and desktop screenshots of the main pages.
// Usage: node scripts/screenshots.mjs [baseUrl] [outDir]
import { chromium, devices } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.argv[2] ?? 'http://localhost:3200';
const outDir = process.argv[3] ?? 'screenshots';
const pages = ['/', '/salario-liquido', '/decimo-terceiro', '/rescisao', '/hora-extra', '/limite-mei', '/fim-da-escala-6x1', '/atualizacoes', '/app'];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const targets = {
  mobile: { ...devices['Pixel 7'] },
  desktop: { viewport: { width: 1280, height: 800 } },
};

for (const [name, options] of Object.entries(targets)) {
  const context = await browser.newContext({ ...options, locale: 'pt-BR' });
  const page = await context.newPage();
  for (const path of pages) {
    const response = await page.goto(baseUrl + path, { waitUntil: 'networkidle' });
    if (!response || response.status() >= 400) continue;
    const slug = path === '/' ? 'home' : path.slice(1).replaceAll('/', '-');
    await page.screenshot({ path: `${outDir}/${slug}-${name}.png`, fullPage: true });
  }
  await context.close();
}
await browser.close();
