import { expect, test } from '@playwright/test';
import { resultado, viajarPara, vigiarErros } from './ajuda';

test.beforeEach(async ({ page }) => viajarPara(page, '2026-11-10T10:00:00'));

test('dismissal without cause: proportional notice, 13º, vacation and the FGTS penalty', async ({ page }) => {
  const semErros = await vigiarErros(page);
  await page.goto('/rescisao?motivo=sem-justa-causa&salario=3.000,00&admissao=2024-03-10&saida=2026-11-10&aviso=indenizado&vencidas=0&dependentes=0&fgts=5.000,00');
  await expect(resultado(page)).toContainText('R$ 10.276,40');
  await expect(page.getByText('36 dias (30 + 3 por ano completo)')).toBeVisible();
  await expect(page.getByText(/Multa de 40% do FGTS: R\$ 2\.243,20/)).toBeVisible();
  await expect(page.getByText('Pagamento até 20/11/2026 (10 dias após a saída)')).toBeVisible();
  semErros();
});

test('resignation: the notice options change and there is no FGTS penalty', async ({ page }) => {
  await page.goto('/rescisao');
  await page.getByRole('radio', { name: 'Pedi demissão' }).check({ force: true });
  await expect(page.getByText('Não vou cumprir')).toBeVisible();
  await expect(page.getByText(/não há multa do FGTS/)).toBeVisible();
});

test('justa causa hides the notice and keeps only salary balance and expired vacation', async ({ page }) => {
  await page.goto('/rescisao?motivo=justa-causa&salario=3.000,00&admissao=2023-01-15&saida=2026-06-15&vencidas=1&dependentes=0');
  await expect(page.getByRole('group', { name: 'Aviso prévio' })).toHaveCount(0);
  await expect(resultado(page)).toContainText('R$ 5.387,50');
});
