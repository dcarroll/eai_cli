import { expect, test } from '@oclif/test';

describe('eai language datasets retrain', () => {
  test
    .stdout()
    .command(['eai language datasets retrain'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['eai language datasets retrain', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
