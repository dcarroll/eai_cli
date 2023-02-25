import { expect, test } from '@oclif/test';

describe('eai language datasets train', () => {
  test
    .stdout()
    .command(['eai language datasets train'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['eai language datasets train', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
