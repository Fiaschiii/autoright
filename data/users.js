// Usuários públicos do SauceDemo (listados na própria tela de login).
// A senha pode ser sobrescrita por variável de ambiente, como em um projeto real.
const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const users = {
  standard: { username: 'standard_user', password: PASSWORD },
  lockedOut: { username: 'locked_out_user', password: PASSWORD },
  problem: { username: 'problem_user', password: PASSWORD },
  performanceGlitch: { username: 'performance_glitch_user', password: PASSWORD },
  invalid: { username: 'usuario_inexistente', password: 'senha_errada' },
};
