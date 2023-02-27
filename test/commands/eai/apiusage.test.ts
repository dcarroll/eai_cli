import { expect, test } from '@oclif/test';

describe('eai apiusage', () => {
  test
    .stdout()
    .command(['eai apiusage'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['eai apiusage', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
