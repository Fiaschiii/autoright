import { test, expect } from '../fixtures/test.js';
import { customer, products, messages, TAX_RATE } from '../data/checkout.js';

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('deve finalizar uma compra completa', { tag: '@smoke' }, async ({ page, inventoryPage, cartPage, checkoutPage }) => {
    // `test.step` organiza o relatório HTML em etapas legíveis
    await test.step('adicionar produtos ao carrinho', async () => {
      await inventoryPage.addToCart(products.backpack.id);
      await inventoryPage.addToCart(products.bikeLight.id);
      await inventoryPage.openCart();
      await cartPage.checkout();
    });

    await test.step('preencher dados do cliente', async () => {
      await expect(page).toHaveURL(/checkout-step-one\.html/);
      await checkoutPage.fillInformation(customer);
    });

    await test.step('conferir resumo e finalizar', async () => {
      await expect(page).toHaveURL(/checkout-step-two\.html/);
      await expect(checkoutPage.itemNames).toHaveText([products.backpack.name, products.bikeLight.name]);
      await checkoutPage.finish();
    });

    await test.step('validar confirmação', async () => {
      await expect(page).toHaveURL(/checkout-complete\.html/);
      await expect(checkoutPage.completeHeader).toHaveText(messages.orderComplete);
      await expect(checkoutPage.cartBadge).toBeHidden();
    });
  });

  test('deve calcular subtotal, imposto e total corretamente', async ({ inventoryPage, cartPage, checkoutPage }) => {
    const selected = [products.backpack, products.boltTShirt, products.onesie];
    for (const product of selected) {
      await inventoryPage.addToCart(product.id);
    }
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(customer);

    const summary = await checkoutPage.getSummary();
    const expectedSubtotal = selected.reduce((sum, p) => sum + p.price, 0);
    const expectedTax = Math.round(expectedSubtotal * TAX_RATE * 100) / 100;

    expect(summary.subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(summary.tax).toBeCloseTo(expectedTax, 2);
    expect(summary.total).toBeCloseTo(summary.subtotal + summary.tax, 2);
  });

  test.describe('validação do formulário', () => {
    test.beforeEach(async ({ inventoryPage, cartPage }) => {
      await inventoryPage.addToCart(products.backpack.id);
      await inventoryPage.openCart();
      await cartPage.checkout();
    });

    const cases = [
      { field: 'nome', data: { ...customer, firstName: '' }, error: messages.firstNameRequired },
      { field: 'sobrenome', data: { ...customer, lastName: '' }, error: messages.lastNameRequired },
      { field: 'CEP', data: { ...customer, postalCode: '' }, error: messages.postalCodeRequired },
    ];

    for (const { field, data, error } of cases) {
      test(`deve exigir ${field}`, async ({ page, checkoutPage }) => {
        await checkoutPage.fillInformation(data);

        await expect(checkoutPage.errorMessage).toHaveText(error);
        await expect(page).toHaveURL(/checkout-step-one\.html/);
      });
    }
  });

  test('deve cancelar o checkout e voltar ao carrinho', async ({ page, inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart(products.backpack.id);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.cancelButton.click();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.items).toHaveCount(1);
  });
});
