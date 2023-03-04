import { expect, test } from '@oclif/test';

describe('eai auth host', () => {
  test
    .stdout()
    .command(['eai auth host'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['eai auth host', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
