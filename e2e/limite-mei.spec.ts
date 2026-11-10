import { expect, test, type Page } from '@playwright/test';
import { viajarPara } from './ajuda';

test.beforeEach(async ({ page }) => viajarPara(page, '2026-10-28T10:00:00'));

const ficha = (page: Page) => page.getByRole('group', { name: /Limite do MEI/ });

test('shows the share of the limit used and the projection', async ({ page }) => {
  await page.goto('/limite-mei');
  await expect(ficha(page)).toContainText('Você usou 72% do limite');
  await expect(ficha(page)).toContainText('R$ 69.960,00');
});

test('warns about a retroactive exit when the pace exceeds the limit by more than 20%', async ({ page }) => {
  await page.goto('/limite-mei');
  await page.getByLabel('Faturamento em 2026 até agora').fill('60.000');
  await page.getByLabel('Faturamento contado até o mês de').selectOption('6');
  await expect(ficha(page)).toContainText('O limite seria ultrapassado em setembro');
  await expect(ficha(page)).toContainText('retroativo');
});

test('applies the LC 238/2026 limit and prorates it for a business opened in 2027', async ({ page }) => {
  await page.goto('/limite-mei?ano=2027&faturado=10.000&ate=3&abertura=3');
  await expect(ficha(page)).toContainText('R$ 91.666,70');
  await expect(ficha(page)).toContainText('10 meses × R$ 9.166,67');
});
