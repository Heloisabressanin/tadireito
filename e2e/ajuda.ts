import { expect, type Page } from '@playwright/test';

/** Fails the test on any console error, uncaught exception or CSP violation. */
export async function vigiarErros(page: Page) {
  const erros: string[] = [];
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`));
  });
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  page.on('pageerror', (e) => erros.push(e.message));
  return () => expect(erros, 'console errors').toEqual([]);
}

/** Freezes the browser clock at a moment in Brasília time. */
export async function viajarPara(page: Page, dataHora: string) {
  await page.clock.setFixedTime(new Date(`${dataHora}-03:00`));
}

export const resultado = (page: Page) => page.locator('[aria-live=polite]').first();
