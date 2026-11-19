import { styleText } from 'node:util';

/**
 * Reporter customizado: mostra no terminal o status do processo
 * (iniciado, em andamento, finalizado, deu certo ou deu erro).
 *
 * O Playwright chama estes métodos automaticamente durante a execução.
 * Documentação: https://playwright.dev/docs/api/class-reporter
 *
 * @implements {import('@playwright/test/reporter').Reporter}
 */
export default class StatusReporter {
  total = 0;
  done = 0;
  passed = 0;
  /** @type {{ title: string, error: string }[]} */
  failures = [];
  startTime = 0;

  printsToStdio() {
    return true;
  }

  /**
   * @param {import('@playwright/test/reporter').FullConfig} config
   * @param {import('@playwright/test/reporter').Suite} suite
   */
  onBegin(config, suite) {
    this.startTime = Date.now();
    this.total = suite.allTests().length;
    const projects = suite.suites.map((s) => s.title).filter(Boolean);

    log('');
    log(styleText(['bold', 'cyan'], '>> Processo iniciado'));
    log(`   ${this.total} testes | navegadores: ${projects.join(', ')} | workers: ${config.workers}`);
    log(styleText(['bold', 'yellow'], '>> Processo em andamento...'));
  }

  /**
   * @param {import('@playwright/test/reporter').TestCase} test
   * @param {import('@playwright/test/reporter').TestResult} result
   */
  onTestEnd(test, result) {
    const willRetry = result.status !== test.expectedStatus
      && result.status !== 'skipped'
      && result.retry < test.retries;

    const name = testName(test);
    const time = formatDuration(result.duration);

    if (willRetry) {
      log(styleText('yellow', `   [retry] falhou, tentando de novo (${result.retry + 1}/${test.retries}): ${name}`));
      return;
    }

    this.done += 1;
    const counter = `[${String(this.done).padStart(String(this.total).length)}/${this.total}]`;
    const ok = test.outcome() === 'expected' || test.outcome() === 'flaky';

    if (result.status === 'skipped') {
      log(styleText('gray', `   ${counter} PULADO ${name}`));
    } else if (ok) {
      this.passed += 1;
      log(`   ${counter} ${styleText('green', 'OK    ')} ${name} ${styleText('gray', `(${time})`)}`);
    } else {
      const error = firstLine(result.error?.message);
      this.failures.push({ title: name, error });
      log(`   ${counter} ${styleText('red', 'ERRO  ')} ${name} ${styleText('gray', `(${time})`)}`);
      log(styleText('red', `            motivo: ${error}`));
    }
  }

  /** Erros fora dos testes (ex.: config inválida, site fora do ar no setup) */
  onError(error) {
    log(styleText(['bold', 'red'], `>> Processo deu erro: ${firstLine(error.message)}`));
  }

  /** @param {import('@playwright/test/reporter').FullResult} result */
  onEnd(result) {
    const time = formatDuration(Date.now() - this.startTime);

    log('');
    log(styleText(['bold', 'cyan'], `>> Processo finalizado em ${time}`));
    log(`   ${this.passed} ok | ${this.failures.length} com erro | ${this.total - this.done} não executados`);

    if (result.status === 'passed') {
      log(styleText(['bold', 'green'], '>> Processo deu certo'));
    } else {
      const reason = {
        failed: 'testes falharam',
        timedout: 'tempo limite global estourado',
        interrupted: 'execução interrompida',
      }[result.status] ?? result.status;

      log(styleText(['bold', 'red'], `>> Processo deu erro (${reason})`));
      for (const f of this.failures) {
        log(styleText('red', `   - ${f.title}`));
      }
      log(styleText('gray', '   Detalhes completos: npm run report'));
    }
    log('');
  }
}

function log(message) {
  process.stdout.write(`${message}\n`);
}

/** @param {import('@playwright/test/reporter').TestCase} test */
function testName(test) {
  // titlePath: ['', projeto, arquivo, describe..., teste]
  const [, project, , ...titles] = test.titlePath();
  return `${project} > ${titles.join(' > ')}`;
}

function firstLine(message = 'erro desconhecido') {
  // Remove códigos de cor ANSI que o Playwright coloca nas mensagens
  // eslint-disable-next-line no-control-regex
  return message.replace(/\u001b\[[0-9;]*m/g, '').split('\n')[0].trim();
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  return `${Math.floor(seconds / 60)}min ${Math.round(seconds % 60)}s`;
}
