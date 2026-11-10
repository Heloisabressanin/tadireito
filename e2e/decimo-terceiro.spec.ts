import { expect, test } from '@playwright/test';
import { resultado, viajarPara, vigiarErros } from './ajuda';

test('splits the 13º into two installments with the 2026 deadlines', async ({ page }) => {
  await viajarPara(page, '2026-11-10T10:00:00');
  const semErros = await vigiarErros(page);
  await page.goto('/decimo-terceiro');
  await expect(resultado(page)).toContainText('R$ 2.751,40');
  await expect(resultado(page)).toContainText('Primeira parcela R$ 1.500,00');
  await expect(page.getByText(/até 18\/12\/2026 \(o dia 20\/12 cai no fim de semana\)/).first()).toBeVisible();
  await expect(page.getByText(/até 30\/11\/2026/).first()).toBeVisible();
  semErros();
});

test('shows no income tax on a R$ 5.000 13º (Lei 15.270)', async ({ page }) => {
  await viajarPara(page, '2026-11-10T10:00:00');
  await page.goto('/decimo-terceiro?salario=5.000,00&meses=12&dependentes=0');
  await expect(page.getByText('ISENTO')).toBeVisible();
  await expect(page.getByText('Nova lei: 13º sem IR para quem ganha até R$ 5.000 ✓')).toBeVisible();
});

test('is proportional to the months worked and refuses more than 12', async ({ page }) => {
  await viajarPara(page, '2026-11-10T10:00:00');
  await page.goto('/decimo-terceiro');
  await page.getByLabel('Meses trabalhados em 2026').fill('6');
  await expect(page.getByText('13º bruto de R$ 1.500,00, em duas parcelas')).toBeVisible();
  await page.getByLabel('Meses trabalhados em 2026').fill('13');
  await expect(page.getByText('De 1 a 12 meses')).toBeVisible();
});
