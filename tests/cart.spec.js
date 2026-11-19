import { test, expect } from '../fixtures/test.js';
import { products } from '../data/checkout.js';

test.describe('Carrinho', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('deve adicionar um produto e atualizar o contador', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await expect(inventoryPage.cartBadge).toBeHidden();

    await inventoryPage.addToCart(products.backpack.id);

    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(products.backpack.id)).toBeVisible();
  });

  test('deve adicionar vários produtos e exibi-los no carrinho', async ({ inventoryPage, cartPage }) => {
    const selected = [products.backpack, products.bikeLight, products.onesie];
    for (const product of selected) {
      await inventoryPage.addToCart(product.id);
    }
    await expect(inventoryPage.cartBadge).toHaveText(String(selected.length));

    await inventoryPage.openCart();

    await expect(cartPage.items).toHaveCount(selected.length);
    await expect(cartPage.itemNames).toHaveText(selected.map((p) => p.name));
  });

  test('deve remover produto pela página do inventário', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.id);
    await inventoryPage.removeFromCart(products.backpack.id);

    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('deve remover produto pela página do carrinho', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.id);
    await inventoryPage.addToCart(products.bikeLight.id);
    await inventoryPage.openCart();

    await cartPage.remove(products.backpack.id);

    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.itemNames).toHaveText([products.bikeLight.name]);
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('deve manter o carrinho após recarregar a página', async ({ page, inventoryPage }) => {
    await inventoryPage.addToCart(products.boltTShirt.id);
    await page.reload();

    await expect(inventoryPage.cartBadge).toHaveText('1');
  });
});
