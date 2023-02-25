import { expect, test } from '@oclif/test';

describe('eai language intent', () => {
  test
    .stdout()
    .command(['eai language intent'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['eai language intent', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
