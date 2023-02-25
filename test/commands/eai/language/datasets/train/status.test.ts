import { expect, test } from '@oclif/test';

describe('eai language datasets train status', () => {
  test
    .stdout()
    .command(['eai language datasets train status'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['eai language datasets train status', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
