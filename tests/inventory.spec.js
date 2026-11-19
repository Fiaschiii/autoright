import { test, expect } from '../fixtures/test.js';
import { SortOption } from '../pages/InventoryPage.js';
import { products } from '../data/checkout.js';
import { users } from '../data/users.js';

test.describe('Inventário', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('deve listar os 6 produtos', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('deve ordenar por nome (A-Z e Z-A)', async ({ inventoryPage }) => {
    await inventoryPage.sortBy(SortOption.NAME_ASC);
    const asc = await inventoryPage.getNames();
    expect(asc).toEqual([...asc].sort((a, b) => a.localeCompare(b)));

    await inventoryPage.sortBy(SortOption.NAME_DESC);
    const desc = await inventoryPage.getNames();
    expect(desc).toEqual([...asc].reverse());
  });

  test('deve ordenar por preço (menor e maior)', async ({ inventoryPage }) => {
    await inventoryPage.sortBy(SortOption.PRICE_ASC);
    const asc = await inventoryPage.getPrices();
    expect(asc).toEqual([...asc].sort((a, b) => a - b));

    await inventoryPage.sortBy(SortOption.PRICE_DESC);
    const desc = await inventoryPage.getPrices();
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  test('deve abrir a página de detalhes do produto', async ({ page, inventoryPage }) => {
    await inventoryPage.openProduct(products.backpack.name);

    await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
    // É uma SPA: a URL muda antes de a lista sair da tela (visto no WebKit).
    // Esperar um elemento exclusivo da página de detalhes evita a race condition.
    await expect(page.getByTestId('back-to-products')).toBeVisible();
    await expect(page.getByTestId('inventory-item')).toHaveCount(1);
    await expect(page.getByTestId('inventory-item-name')).toHaveText(products.backpack.name);
    await expect(page.getByTestId('inventory-item-price')).toHaveText(`$${products.backpack.price}`);
  });

  test('deve fazer logout', async ({ page, inventoryPage }) => {
    await inventoryPage.logout();

    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('login-button')).toBeVisible();
  });
});

test.describe('Inventário - bugs conhecidos', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  // O SauceDemo tem um usuário com bugs propositais. `test.fail()` documenta
  // um defeito conhecido: o teste passa enquanto o bug existir e avisa quando
  // ele for corrigido (porque aí a asserção deixa de falhar).
  test('problem_user exibe a mesma imagem para todos os produtos', async ({ page, loginPage }) => {
    test.fail(true, 'Bug conhecido: problem_user recebe imagens quebradas');

    await loginPage.goto();
    await loginPage.login(users.problem.username, users.problem.password);

    const sources = await page.locator('img.inventory_item_img').evaluateAll(
      (imgs) => imgs.map((img) => img.getAttribute('src')),
    );
    expect(new Set(sources).size, 'cada produto deveria ter sua própria imagem').toBe(6);
  });
});
