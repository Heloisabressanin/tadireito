import { devices, expect, test } from '@playwright/test';
import { vigiarErros } from './ajuda';

test('shows first the install steps for the visitor’s device', async ({ page }, testInfo) => {
  const semErros = await vigiarErros(page);
  await page.goto('/app');
  const primeiro = page.locator('section[aria-labelledby=como-instalar] h3').first();
  await expect(primeiro).toHaveText(testInfo.project.name === 'mobile' ? 'No Android' : 'No computador');
  await expect(page.getByText('Instalar em outro aparelho')).toBeVisible();
  semErros();
});

test.describe('on an iPhone', () => {
  test.use({ userAgent: devices['iPhone 15'].userAgent });

  test('explains the Safari "Adicionar à Tela de Início" steps', async ({ page }) => {
    await page.goto('/app');
    await expect(page.locator('section[aria-labelledby=como-instalar] h3').first()).toHaveText('No iPhone ou iPad');
    await expect(page.getByText('Adicionar à Tela de Início').first()).toBeVisible();
  });
});

test('is promoted from the home page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Instale o Tá Direito no celular/ }).click();
  await expect(page).toHaveURL(/\/app$/);
});
