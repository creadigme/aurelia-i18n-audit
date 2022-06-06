import { I18NSeeker } from './i18n-seeker';
import * as assert from 'assert';

describe('i18n-seeker', () => {
  describe('default separators', () => {
    const seeker = new I18NSeeker();

    before(async () => {
      await seeker.initialize({
        nsSeparator: ':',
        nestedSeparator: '.',
        defaultNS: undefined,
        attributes: ['t'],
        customMatchers: [],
      });
    });

    describe('attribute .bind .one-time', () => {
      it('ns:key', async () => {
        const keys = getI18NKeys(
          seeker,
          `
        <div class="something else" title.one-time="'EASY:PAUSE' & t">?</div>
        <div class="something else" title.bind="'EASY:START' & t">?</div>
        <div class="something else" title.one-time="'EASY:START' & t">?</div>
          <div class="something else" title.bind="'EASY:STOP' & t">?</div>
          <!-- ignore this -->
          <div class="something else" title.one-time="EASY:START">?</div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 4);

        assert.strictEqual(keys[0], 'EASY:PAUSE');
        assert.strictEqual(keys[1], 'EASY:START');
        assert.strictEqual(keys[2], 'EASY:START');
        assert.strictEqual(keys[3], 'EASY:STOP');
      });

      it('ns:key.subkey', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else" title.bind="'EASY:STOP.SPEC' & t">?</div>
          <div class="something else" title.bind="'EASY:START.SPEC' & t">?</div>
          <div class="something else" title.one-time="'EASY:PAUSE.SPEC' & t">?</div>
          <div class="something else" title.one-time="'EASY:START.SPEC' & t">?</div>
          <!-- ignore this -->
          <div class="something else" title.one-time="EASY:START.SPEC">?</div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 4);

        assert.strictEqual(keys[0], 'EASY:PAUSE.SPEC');
        assert.strictEqual(keys[1], 'EASY:START.SPEC');
        assert.strictEqual(keys[2], 'EASY:START.SPEC');
        assert.strictEqual(keys[3], 'EASY:STOP.SPEC');
      });

      it('key.subkey', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else" title.bind="'STOP.SPEC' & t">?</div>
          <div class="something else" title.bind="'START.SPEC' & t">?</div>
          <div class="something else" title.one-time="'PAUSE.SPEC' & t">?</div>
          <div class="something else" title.one-time="'START.SPEC' & t">?</div>
          <!-- ignore this -->
          <div class="something else" title.one-time="START.SPEC">?</div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 4);

        assert.strictEqual(keys[0], 'PAUSE.SPEC');
        assert.strictEqual(keys[1], 'START.SPEC');
        assert.strictEqual(keys[2], 'START.SPEC');
        assert.strictEqual(keys[3], 'STOP.SPEC');
      });

      it('key', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else" title.bind="'STOP' & t">?</div>
          <div class="something else" title.bind="'START' & t">?</div>
          <div class="something else" title.one-time="'PAUSE' & t">?</div>
          <div class="something else" title.one-time="'START' & t">?</div>
          <!-- ignore this -->
          <div class="something else" title.one-time="START">?</div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 4);

        assert.strictEqual(keys[0], 'PAUSE');
        assert.strictEqual(keys[1], 'START');
        assert.strictEqual(keys[2], 'START');
        assert.strictEqual(keys[3], 'STOP');
      });
    });

    describe('converter / behavior', () => {
      it('ns:key.subkey', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else">\${"EASY:KEY.STOP" | t} : </div>
          <div class="something else">\${'EASY:KEY.START' & t} : </div>
          <!-- ignore this -->
          <div class="something else">\${'EASY:KEY3.XXXX'} : </div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY.START');
        assert.strictEqual(keys[1], 'EASY:KEY.STOP');
      });

      it('ns:key', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else">\${"EASY:KEY" & t} : </div>
          <div class="something else">\${'EASY:KEY2' | t} : </div>
          <!-- ignore this -->
          <div class="something else">\${'EASY:KEY3'} : </div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY');
        assert.strictEqual(keys[1], 'EASY:KEY2');
      });

      it('key.subkey', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else">\${"KEY.STOP" | t} : </div>
          <div class="something else">\${'KEY.START' & t} : </div>
          <!-- ignore this -->
          <div class="something else">\${'KEY.SUBKEY'} : </div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'KEY.START');
        assert.strictEqual(keys[1], 'KEY.STOP');
      });

      it('key', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else">\${"STOP" & t} : </div>
          <div class="something else">\${'START' | t} : </div>
          <!-- ignore this -->
          <div class="something else">\${'SUBKEY'} : </div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'START');
        assert.strictEqual(keys[1], 'STOP');
      });
    });

    describe('attribute t=', () => {
      it('[placeholder]ns:key.subkey', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else" t="[placeholder]EASY:KEY.STOP"></div>
          <div class="something else" t="[placeholder]EASY:KEY.START"></div>
          <!-- ignore this -->
          <div class="something else tt="[placeholder]EASY:KEY3.XXXX"></div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY.START');
        assert.strictEqual(keys[1], 'EASY:KEY.STOP');
      });

      it('[placeholder]EASY:KEY.STOP;[placeholder]EASY:KEY.START', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else" t="[placeholder]EASY:KEY.STOP;[placeholder]EASY:KEY.START"></div>
          <!-- ignore this -->
          <div class="something else tt="[placeholder]EASY:KEY3.XXXX"></div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY.START');
        assert.strictEqual(keys[1], 'EASY:KEY.STOP');
      });

      it('ns:key.subkey', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else" t="EASY:KEY.STOP"></div>
          <div class="something else" t="EASY:KEY.START"></div>
          <!-- ignore this -->
          <div class="something else tt="EASY:KEY3.XXXX"></div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY.START');
        assert.strictEqual(keys[1], 'EASY:KEY.STOP');
      });

      it('ns:key', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else" t="EASY:KEY"></div>
          <div class="something else" t="EASY:KEY2"></div>
          <!-- ignore this -->
          <div class="something else" tt="EASY:KEY3"></div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY');
        assert.strictEqual(keys[1], 'EASY:KEY2');
      });

      it('key.subkey', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else" t="KEY.STOP"></div>
          <div class="something else" t="KEY.START"></div>
          <!-- ignore this -->
          <div class="something else" tt="KEY.SUBKEY"></div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'KEY.START');
        assert.strictEqual(keys[1], 'KEY.STOP');
      });

      it('key', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          <div class="something else" t="STOP"></div>
          <div class="something else" t="START"></div>
          <!-- ignore this -->
          <div class="something else" tt="SUBKEY"></div>`,
          '.html'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'START');
        assert.strictEqual(keys[1], 'STOP');
      });
    });

    describe('TypeScript - i18n.tr(', () => {
      it('ns:key.subkey', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          public something() {
            return [this.i18n.tr('EASY:KEY.START'), this.i18n.tr("EASY:KEY.STOP"), this.something.ab('EASY:KEY3')];
          }`,
          '.ts'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY.START');
        assert.strictEqual(keys[1], 'EASY:KEY.STOP');
      });

      it('ns:key', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          public something() {
            return [this.i18n.tr('EASY:KEY'), this.i18n.tr("EASY:KEY2"), this.something.ab('EASY:KEY3')];
          }`,
          '.ts'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY');
        assert.strictEqual(keys[1], 'EASY:KEY2');
      });

      it('key.subkey', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          public something() {
            return [this.i18n.tr('KEY.START'), this.i18n.tr("KEY.STOP"), this.something.ab('EASY:KEY3')];
          }`,
          '.ts'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'KEY.START');
        assert.strictEqual(keys[1], 'KEY.STOP');
      });

      it('key', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          public something() {
            return [this.i18n.tr('START'), this.i18n.tr("STOP"), this.something.ab('KEY3')];
          }`,
          '.ts'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'START');
        assert.strictEqual(keys[1], 'STOP');
      });
    });

    describe('Auto discovery', () => {
      const customSeeker: I18NSeeker = new I18NSeeker();

      before(async () => {
        await customSeeker.initialize(
          {
            nsSeparator: ':',
            nestedSeparator: '.',
            defaultNS: 'EASY',
            autoDiscovery: true,
          },
          ['EASY']
        );
      });

      it('ns:key.subkey', async () => {
        const keys = getI18NKeys(
          customSeeker,
          `
          public something() {
            return [this.justDo('EASY:KEY.START'), this.justDoIt('',"EASY:KEY.STOP"), this.something.ab('EASY_KEY3')];
          }`,
          '.ts'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY.START');
        assert.strictEqual(keys[1], 'EASY:KEY.STOP');
      });

      it('ns:key', async () => {
        const keys = getI18NKeys(
          customSeeker,
          `
          public something() {
            return [this.doIt('EASY:KEY'), this.doIt("","EASY:KEY2"), this.something.ab('EASY_KEY3')];
          }`,
          '.ts'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY');
        assert.strictEqual(keys[1], 'EASY:KEY2');
      });
    });

    describe('Custom matcher', () => {
      const customSeeker: I18NSeeker = new I18NSeeker();

      before(async () => {
        await customSeeker.initialize(
          {
            nsSeparator: ':',
            nestedSeparator: '.',
            defaultNS: undefined,
            attributes: ['t'],
            customMatchers: [/['"](EASY:[\w\-:.]{3,})['"]/gi, /['"](EASY\.[\w\-:.]{3,})['"]/gi, /['"](KEY\.[\w\-:.]{3,})['"]/gi],
          },
          ['translation']
        );
      });

      it('ns:key.subkey', async () => {
        const keys = getI18NKeys(
          customSeeker,
          `
          public something() {
            return [this.justDo('EASY:KEY.START'), this.justDoIt('',"EASY:KEY.STOP"), this.something.ab('EASY_KEY3')];
          }`,
          '.ts'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY.START');
        assert.strictEqual(keys[1], 'EASY:KEY.STOP');
      });

      it('ns:key', async () => {
        const keys = getI18NKeys(
          customSeeker,
          `
          public something() {
            return [this.doIt('EASY:KEY'), this.doIt("","EASY:KEY2"), this.something.ab('EASY_KEY3')];
          }`,
          '.ts'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY');
        assert.strictEqual(keys[1], 'EASY:KEY2');
      });

      it('key.subkey', async () => {
        const keys = getI18NKeys(
          customSeeker,
          `
          public something() {
            return [this.doIt('KEY.START'), this.doItdoIt(' ', "KEY.STOP"), this.something.ab('EASY_KEY3')];
          }`,
          '.ts'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'KEY.START');
        assert.strictEqual(keys[1], 'KEY.STOP');
      });

      it('key : we ignore simple key with this custom regexp', async () => {
        const keys = getI18NKeys(
          customSeeker,
          `
          public something() {
            return [this.doIt('START'), this.doItdoIt("abc kjjk", "STOP"), this.something.ab('KEY3')];
          }`,
          '.ts'
        );

        assert.strictEqual(keys.length, 0);
      });
    });

    describe('JS file - i18n.tr(', () => {
      it('ns:key.subkey', async () => {
        const keys = getI18NKeys(
          seeker,
          `
          function something() {
            // this.i18n.tr('EASY:ANOTHER.ONE')
            return [this.i18n.tr('EASY:KEY.START'), this.i18n.tr("EASY:KEY.STOP"), this.something.ab('EASY:KEY3')];
          }`,
          '.js'
        );

        assert.strictEqual(keys.length, 2);

        assert.strictEqual(keys[0], 'EASY:KEY.START');
        assert.strictEqual(keys[1], 'EASY:KEY.STOP');
      });
    });
  });
});

function getI18NKeys(seeker: I18NSeeker, code: string, ext: string) {
  const keys: string[] = [];

  seeker.searchI18NKeys(code, ext, (res /*, linePos, colPos*/) => {
    keys.push(`${res.ns ? res.ns + ':' : ''}${res.key || '_'}${res.subkey ? '.' + res.subkey : ''}`);
  });
  return keys.sort();
}
