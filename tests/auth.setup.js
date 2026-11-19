import { test as setup, expect } from '../fixtures/test.js';
import { users } from '../data/users.js';
import { STORAGE_STATE } from '../playwright.config.js';

/**
 * Roda antes de todos os projetos (veja `dependencies` no config).
 * Faz o login pela interface uma vez e salva cookies + localStorage,
 * para que os demais testes já comecem autenticados.
 */
setup('autenticar standard_user', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(users.standard.username, users.standard.password);
  await expect(page).toHaveURL(/inventory\.html/);

  await page.context().storageState({ path: STORAGE_STATE });
});
