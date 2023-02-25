import { expect, test } from '@oclif/test';

describe('eai language datasets delete status', () => {
  test
    .stdout()
    .command(['eai language datasets delete status'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['eai language datasets delete status', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
