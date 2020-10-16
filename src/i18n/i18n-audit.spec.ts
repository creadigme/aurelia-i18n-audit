import { I18NAudit } from './i18n-audit';
import * as path from 'path';
import { FakeI18NBackend } from '../test/fake-i18n-backend.spec';
import * as assert from 'assert';
import { ELevel } from './e-level';

describe('i18n-audit', () => {
  describe('lint', () => {
    describe('local', () => {
      it('html without i18n', async () => {
        const audit = new I18NAudit({
          srcPaths: [path.resolve('.\\samples\\wo_i18n\\src')],
          local: {
            i18nPaths: [path.resolve('.\\samples\\wo_i18n\\i18n')],
          },
        });

        await audit.initializeAsync();
        const details = await audit.validateAsync();
        assert.strictEqual(details.isOk, false);
        assert.strictEqual(details.languages.length, 0);
        assert.strictEqual(Object.keys(details.missingKeys).length, 2);
      });

      it('easy', async () => {
        const audit = new I18NAudit({
          srcPaths: [path.resolve('.\\samples\\case_01\\src')],
          local: {
            i18nPaths: [path.resolve('.\\samples\\case_01\\i18n')],
          },
          level: ELevel.EASY,
        });

        await audit.initializeAsync();
        const details = await audit.validateAsync();
        assert.strictEqual(details.isOk, true);
        assert.strictEqual(details.languages.length, 1);
        assert.strictEqual(details.unused.length, 1);
        assert.strictEqual(Object.keys(details.missingKeys).length, 3);
      });

      it('medium', async () => {
        const audit = new I18NAudit({
          srcPaths: [path.resolve('.\\samples\\case_01\\src')],
          local: {
            i18nPaths: [path.resolve('.\\samples\\case_01\\i18n')],
          },
          level: ELevel.MEDIUM,
        });

        await audit.initializeAsync();
        const details = await audit.validateAsync();
        assert.strictEqual(details.isOk, false);
        assert.strictEqual(details.languages.length, 1);
        assert.strictEqual(details.unused.length, 1);
        assert.strictEqual(Object.keys(details.missingKeys).length, 3);
      });

      it('hard', async () => {
        const audit = new I18NAudit({
          srcPaths: [path.resolve('.\\samples\\case_01\\src')],
          local: {
            i18nPaths: [path.resolve('.\\samples\\case_01\\i18n')],
          },
          level: ELevel.HARD,
        });

        await audit.initializeAsync();
        const details = await audit.validateAsync();
        assert.strictEqual(details.isOk, false);
        assert.strictEqual(details.languages.length, 1);
        assert.strictEqual(details.unused.length, 1);
        assert.strictEqual(Object.keys(details.missingKeys).length, 3);
      });

      it('ignore keys', async () => {
        const audit = new I18NAudit({
          srcPaths: [path.resolve('.\\samples\\case_01\\src')],
          local: {
            i18nPaths: [path.resolve('.\\samples\\case_01\\i18n')],
          },
          level: ELevel.HARD,
          ignoreKeys: /^EASY.*/i,
        });

        await audit.initializeAsync();
        const details = await audit.validateAsync();
        assert.strictEqual(details.isOk, false);
        assert.strictEqual(details.languages.length, 1);
        assert.strictEqual(details.unused.length, 4);
        assert.strictEqual(Object.keys(details.missingKeys).length, 0);
      });
    });

    describe('remote', () => {
      const fakeI18nBackend = new FakeI18NBackend();

      before(async () => {
        return await fakeI18nBackend.start();
      });

      after(() => {
        fakeI18nBackend.stop();
      });

      it('html with i18n', async () => {
        const audit = new I18NAudit({
          i18nConfig: {
            namespaces: ['EASY'],
            languages: ['en', 'fr'],
          },
          remote: {
            url: `http://localhost:${fakeI18nBackend.port}/i18n/{{ns}}/{{lang}}`,
          },
          srcPaths: [path.resolve('.\\samples\\case_01\\src')],
        });

        await audit.initializeAsync();
        const details = await audit.validateAsync();
        assert.strictEqual(details.isOk, false);
        assert.strictEqual(details.languages.length, 2);
        assert.strictEqual(Object.keys(details.missingKeys).length, 3);
      });
    });
  });
});
