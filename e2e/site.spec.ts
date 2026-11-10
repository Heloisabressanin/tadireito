import { expect, test } from '@playwright/test';
import { vigiarErros } from './ajuda';

const PAGINAS = ['/', '/salario-liquido', '/hora-extra', '/limite-mei', '/fim-da-escala-6x1', '/atualizacoes', '/app', '/sobre', '/privacidade', '/termos'];

for (const caminho of PAGINAS) {
  test(`${caminho} renders without errors and with its own title`, async ({ page }) => {
    const semErros = await vigiarErros(page);
    await page.goto(caminho);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(/Tá Direito/);
    semErros();
  });
}

test('serves the SEO and PWA files', async ({ request }) => {
  expect((await request.get('/sitemap.xml')).ok()).toBe(true);
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.short_name).toBe('Tá Direito');
});

test('sends the security headers', async ({ request }) => {
  const headers = (await request.get('/')).headers();
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-powered-by']).toBeUndefined();
});

test('shows a helpful 404 page', async ({ page }) => {
  const resposta = await page.goto('/pagina-que-nao-existe');
  expect(resposta?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
});
