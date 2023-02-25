import { expect, test } from '@oclif/test';

describe('eai language datasets examples create', () => {
  test
    .stdout()
    .command(['eai language datasets examples create'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['eai language datasets examples create', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
