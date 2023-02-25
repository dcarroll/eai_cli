import { expect, test } from '@oclif/test';

describe('eai language models metrics', () => {
  test
    .stdout()
    .command(['eai language models metrics'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['eai language models metrics', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
