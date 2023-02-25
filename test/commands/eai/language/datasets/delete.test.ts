import { expect, test } from '@oclif/test';

describe('eai language datasets delete', () => {
  test
    .stdout()
    .command(['eai language datasets delete'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['eai language datasets delete', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
