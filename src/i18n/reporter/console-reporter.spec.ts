import * as assert from 'assert';
import { ConsoleReporter } from './console-reporter';

describe('console-reporter', () => {
  describe('verbose', () => {
    const consoleReporter = new ConsoleReporter(true);
    it('None', async () => {
      assert.deepStrictEqual(
        await consoleReporter.reportAsync({
          unused: [],
          missingKeys: [],
          missingLangs: [],
          isOk: true,
          languages: [],
        }),
        ['\u001b[32m[i18n] 0 languages detected ().\u001b[39m']
      );
    });

    it('Unused one', async () => {
      assert.deepStrictEqual(
        await consoleReporter.reportAsync({
          unused: ['One'],
          missingKeys: [],
          missingLangs: [],
          isOk: true,
          languages: [],
        }),
        ['\u001b[32m[i18n] 0 languages detected ().\u001b[39m', '\u001b[1m\u001b[33m[i18n] 1 keys seems not to be used (maybe server side?).\u001b[39m\u001b[22m', '\u001b[33m\tOne\u001b[39m\n\u001b[33m\u001b[39m']
      );
    });

    it('Missing keys', async () => {
      assert.deepStrictEqual(
        await consoleReporter.reportAsync({
          unused: [],
          missingKeys: [{ key: 'One', sources: ['here'] }],
          missingLangs: [],
          isOk: true,
          languages: [],
        }),
        ['\u001b[32m[i18n] 0 languages detected ().\u001b[39m', '\u001b[1m\u001b[31m[i18n] 1 keys are not defined.\u001b[39m\u001b[22m', '\u001b[31m\tOne\u001b[39m', '\u001b[33m\t\t- here\u001b[39m', '']
      );
    });

    it('Missing langs', async () => {
      assert.deepStrictEqual(
        await consoleReporter.reportAsync({
          unused: [],
          missingKeys: [],
          missingLangs: [{ key: 'One', langs: ['DE'] }],
          isOk: true,
          languages: [],
        }),
        ['\u001b[32m[i18n] 0 languages detected ().\u001b[39m', '\u001b[1m\u001b[31m[i18n] 1 keys do not have all the languages translated.\u001b[39m\u001b[22m', '\u001b[31m\tOne (DE)\u001b[39m\n\u001b[31m\u001b[39m']
      );
    });
  });

  describe('summary', () => {
    const consoleReporter = new ConsoleReporter(false);
    it('None', async () => {
      assert.deepStrictEqual(
        await consoleReporter.reportAsync({
          unused: [],
          missingKeys: [],
          missingLangs: [],
          isOk: true,
          languages: [],
        }),
        ['\u001b[32m[i18n] 0 languages detected ().\u001b[39m']
      );
    });

    it('Unused one', async () => {
      assert.deepStrictEqual(
        await consoleReporter.reportAsync({
          unused: ['One'],
          missingKeys: [],
          missingLangs: [],
          isOk: true,
          languages: [],
        }),
        ['\u001b[32m[i18n] 0 languages detected ().\u001b[39m', '\u001b[1m\u001b[33m[i18n] 1 keys seems not to be used (maybe server side?).\u001b[39m\u001b[22m']
      );
    });

    it('Missing keys', async () => {
      assert.deepStrictEqual(
        await consoleReporter.reportAsync({
          unused: [],
          missingKeys: [{ key: 'One', sources: ['here'] }],
          missingLangs: [],
          isOk: true,
          languages: [],
        }),
        ['\u001b[32m[i18n] 0 languages detected ().\u001b[39m', '\u001b[1m\u001b[31m[i18n] 1 keys are not defined.\u001b[39m\u001b[22m']
      );
    });

    it('Missing langs', async () => {
      assert.deepStrictEqual(
        await consoleReporter.reportAsync({
          unused: [],
          missingKeys: [],
          missingLangs: [{ key: 'One', langs: ['DE'] }],
          isOk: true,
          languages: [],
        }),
        ['\u001b[32m[i18n] 0 languages detected ().\u001b[39m', '\u001b[1m\u001b[31m[i18n] 1 keys do not have all the languages translated.\u001b[39m\u001b[22m']
      );
    });
  });
});
