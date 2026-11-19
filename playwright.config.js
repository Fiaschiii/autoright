// @ts-check
import { defineConfig, devices } from '@playwright/test';

export const STORAGE_STATE = 'playwright/.auth/standard_user.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Impede que um `test.only` esquecido vá para o CI
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  // status-reporter: mensagens de andamento no terminal (reporters/status-reporter.js)
  // html: relatório detalhado, aberto com `npm run report`
  reporter: process.env.CI
    ? [['./reporters/status-reporter.js'], ['html', { open: 'never' }], ['github']]
    : [['./reporters/status-reporter.js'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'https://www.saucedemo.com',
    // O SauceDemo usa o atributo data-test, então getByTestId() procura por ele
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Câmera lenta opcional para acompanhar com os olhos: SLOWMO=800 (ms entre ações)
    launchOptions: { slowMo: Number(process.env.SLOWMO ?? 0) },
  },

  projects: [
    // 1) Faz login uma única vez e salva a sessão (cookies) em arquivo
    { name: 'setup', testMatch: /.*\.setup\.js/ },

    // 2) Os demais testes reaproveitam essa sessão e já começam logados
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
  ],
});
