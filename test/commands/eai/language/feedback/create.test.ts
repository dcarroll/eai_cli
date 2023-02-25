import { expect, test } from '@oclif/test';

describe('eai language feedback create', () => {
  test
    .stdout()
    .command(['eai language feedback create'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['eai language feedback create', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
