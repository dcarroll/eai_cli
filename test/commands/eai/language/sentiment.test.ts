import { expect, test } from '@oclif/test';

describe('eai language sentiment', () => {
  test
    .stdout()
    .command(['eai language sentiment'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['eai language sentiment', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
