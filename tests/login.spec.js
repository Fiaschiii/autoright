import { test, expect } from '../fixtures/test.js';
import { users } from '../data/users.js';
import { messages } from '../data/checkout.js';

// Estes testes precisam começar deslogados, então descartam a sessão salva
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('deve logar com usuário válido', { tag: '@smoke' }, async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('deve bloquear usuário travado', async ({ page, loginPage }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expect(loginPage.errorMessage).toHaveText(messages.lockedOut);
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  // Teste orientado a dados: o mesmo fluxo com entradas diferentes
  const invalidCases = [
    { name: 'credenciais inválidas', user: users.invalid.username, pass: users.invalid.password, error: messages.invalidCredentials },
    { name: 'usuário vazio', user: '', pass: users.standard.password, error: messages.usernameRequired },
    { name: 'senha vazia', user: users.standard.username, pass: '', error: messages.passwordRequired },
  ];

  for (const { name, user, pass, error } of invalidCases) {
    test(`deve exibir erro com ${name}`, async ({ loginPage }) => {
      await loginPage.login(user, pass);
      await expect(loginPage.errorMessage).toHaveText(error);
    });
  }

  test('não deve acessar o inventário sem estar logado', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(page).toHaveURL('/');
    await expect(loginPage.errorMessage).toContainText("You can only access '/inventory.html' when you are logged in");
  });
});
