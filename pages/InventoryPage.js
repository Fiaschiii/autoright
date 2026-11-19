import { BasePage } from './BasePage.js';

/** Valores aceitos pelo select de ordenação */
export const SortOption = {
  NAME_ASC: 'az',
  NAME_DESC: 'za',
  PRICE_ASC: 'lohi',
  PRICE_DESC: 'hilo',
};

export class InventoryPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  /** @param {string} productId ex.: 'sauce-labs-backpack' */
  async addToCart(productId) {
    await this.page.getByTestId(`add-to-cart-${productId}`).click();
  }

  /** @param {string} productId */
  async removeFromCart(productId) {
    await this.removeButton(productId).click();
  }

  /** @param {string} productId */
  removeButton(productId) {
    return this.page.getByTestId(`remove-${productId}`);
  }

  /** @param {string} option um dos valores de SortOption */
  async sortBy(option) {
    await this.sortSelect.selectOption(option);
  }

  async getNames() {
    return this.itemNames.allTextContents();
  }

  /** @returns {Promise<number[]>} preços como número (sem o "$") */
  async getPrices() {
    const texts = await this.itemPrices.allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  /** @param {string} name */
  async openProduct(name) {
    await this.itemNames.filter({ hasText: name }).click();
  }
}
