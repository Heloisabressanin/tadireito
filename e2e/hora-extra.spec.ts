import { expect, test } from '@playwright/test';
import { resultado, viajarPara, vigiarErros } from './ajuda';

test('compares today with the 42-hour week and flags the estimated divisor', async ({ page }) => {
  await viajarPara(page, '2026-10-28T10:00:00');
  const semErros = await vigiarErros(page);
  await page.goto('/hora-extra');
  await expect(resultado(page)).toContainText('jornada de 44h');
  await expect(resultado(page)).toContainText('R$ 163,64');
  await expect(page.getByText('A partir de 16/12/2026 · 42h')).toBeVisible();
  await expect(page.getByText('+ R$ 7,79 por mês com o mesmo salário')).toBeVisible();
  await expect(page.getByText(/Valor estimado: divisor/)).toBeVisible();
  semErros();
});

test('switches to 42 hours by itself on 16/12/2026', async ({ page }) => {
  await viajarPara(page, '2026-12-16T08:00:00');
  await page.goto('/hora-extra');
  await expect(resultado(page)).toContainText('jornada de 42h');
  await expect(resultado(page)).toContainText('R$ 171,43');
  await expect(page.getByText('A partir de 16/12/2027 · 40h')).toBeVisible();
});

test('refuses an overtime premium below 50%', async ({ page }) => {
  await page.goto('/hora-extra');
  await page.getByLabel('Adicional').fill('40');
  await expect(page.getByText('Mínimo de 50%')).toBeVisible();
});
