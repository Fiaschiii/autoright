import { BasePage } from './BasePage.js';

export class CartPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  /** @param {string} productId */
  async remove(productId) {
    await this.page.getByTestId(`remove-${productId}`).click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
