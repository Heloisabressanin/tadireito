import { expect, test } from '@playwright/test';
import { resultado, viajarPara, vigiarErros } from './ajuda';

test.beforeEach(async ({ page }) => viajarPara(page, '2026-10-28T10:00:00'));

test('computes the net salary as the user types and keeps the inputs in the URL', async ({ page }) => {
  const semErros = await vigiarErros(page);
  await page.goto('/salario-liquido');
  await expect(resultado(page)).toContainText('R$ 3.191,40');

  await page.getByLabel('Salário bruto mensal').fill('8.000');
  await page.getByRole('group', { name: 'Dependentes no Imposto de Renda' }).getByText('2', { exact: true }).click();
  await expect(resultado(page)).toContainText('R$ 6.144,91');
  await expect(page).toHaveURL(/salario=8\.000&dependentes=2/);
  semErros();
});

test('opens a shared link with the same values', async ({ page }) => {
  await page.goto('/salario-liquido?salario=6.000&dependentes=0');
  await expect(page.getByLabel('Salário bruto mensal')).toHaveValue('6.000');
  await expect(resultado(page)).toContainText('R$ 4.973,39');
});

test('explains invalid input instead of showing a wrong result', async ({ page }) => {
  await page.goto('/salario-liquido');
  await page.getByLabel('Salário bruto mensal').fill('abc');
  await expect(page.getByText('Digite um valor válido')).toBeVisible();
  await expect(page.getByText('Corrija os valores acima')).toBeVisible();
});

test('shows the official sources and the verification date', async ({ page }) => {
  await page.goto('/salario-liquido');
  await expect(page.getByText(/Conferido com a lei · \d{2}\/\d{2}\/\d{4}/).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Lei nº 15\.270\/2025/ }).first()).toHaveAttribute('href', /planalto\.gov\.br/);
});

test('warns that values may be outdated once the 2026 INSS table expires', async ({ page }) => {
  await viajarPara(page, '2027-01-05T10:00:00');
  await page.goto('/salario-liquido');
  await expect(page.getByText('Estamos verificando atualizações recentes da lei.')).toBeVisible();
});
