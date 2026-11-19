import { BasePage } from './BasePage.js';

/** Cobre as três etapas: informações, resumo (overview) e confirmação. */
export class CheckoutPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    // Etapa 1: informações do cliente
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.errorMessage = page.getByTestId('error');

    // Etapa 2: resumo do pedido
    this.itemNames = page.getByTestId('inventory-item-name');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');

    // Etapa 3: confirmação
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  /** @param {{ firstName?: string, lastName?: string, postalCode?: string }} data */
  async fillInformation({ firstName = '', lastName = '', postalCode = '' }) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }

  /**
   * Extrai o número de um texto como "Item total: $39.98".
   * @param {string | null} text
   */
  static parseAmount(text) {
    const match = (text ?? '').match(/\$([\d.]+)/);
    if (!match) throw new Error(`Valor não encontrado em: "${text}"`);
    return Number(match[1]);
  }

  async getSummary() {
    const [subtotal, tax, total] = await Promise.all([
      this.subtotalLabel.textContent(),
      this.taxLabel.textContent(),
      this.totalLabel.textContent(),
    ]);
    return {
      subtotal: CheckoutPage.parseAmount(subtotal),
      tax: CheckoutPage.parseAmount(tax),
      total: CheckoutPage.parseAmount(total),
    };
  }
}
