import { I18NAudit } from './i18n-audit';
import * as path from 'path';
import { FakeI18NBackend } from '../test/fake-i18n-backend.spec';
import * as assert from 'assert';
import { ELevel } from './e-level';
import { I18NAuditOptions } from './i18n-audit-options';

describe('i18n-audit', () => {
  describe('config', () => {
    it('i18nConfig options', async () => {
      const audit = new I18NAudit({
        srcPaths: [path.resolve('.\\samples\\wo_i18n\\src')],
        local: {
          i18nPaths: [path.resolve('.\\samples\\wo_i18n\\i18n')],
        },
        i18nConfig: {
          nsSeparator: '#',
          nestedSeparator: '-',
          attributes: ['t', 'tr'],
        },
      });

      assert.strictEqual(audit.options.i18nConfig.nsSeparator, '#');
      assert.strictEqual(audit.options.i18nConfig.nestedSeparator, '-');
      assert.deepStrictEqual(audit.options.i18nConfig.attributes, ['t', 'tr']);
    });
  });

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

      it('without i18nPaths', async () => {
        const audit = new I18NAudit(
          new I18NAuditOptions({
            srcPaths: [path.resolve('.\\samples\\wo_i18n\\src')],
            local: {
              i18nPaths: undefined,
            },
            level: ELevel.EASY,
          })
        );

        await audit.initializeAsync();
        const details = await audit.validateAsync();
        assert.strictEqual(details.isOk, true);
        assert.strictEqual(details.languages.length, 0);
        assert.strictEqual(details.unused.length, 0);
        assert.strictEqual(Object.keys(details.missingKeys).length, 2);
      });

      it('without srcPaths', async () => {
        const audit = new I18NAudit(
          new I18NAuditOptions({
            srcPaths: undefined,
            local: {
              i18nPaths: [path.resolve('.\\samples\\case_01\\i18n')],
            },
            level: ELevel.EASY,
          })
        );

        await audit.initializeAsync();
        const details = await audit.validateAsync();
        assert.strictEqual(details.isOk, true);
        assert.strictEqual(details.languages.length, 1);
        assert.strictEqual(details.unused.length, 4);
        assert.strictEqual(Object.keys(details.missingKeys).length, 0);
      });

      it('easy', async () => {
        const audit = new I18NAudit(
          new I18NAuditOptions({
            srcPaths: [path.resolve('.\\samples\\case_01\\src')],
            local: {
              i18nPaths: [path.resolve('.\\samples\\case_01\\i18n')],
            },
            level: ELevel.EASY,
          })
        );

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
          i18nConfig: {
            attributes: [],
          },
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

      it('Bad backend', async () => {
        const audit = new I18NAudit({
          i18nConfig: {
            namespaces: ['EASY'],
            languages: ['en', 'fr'],
          },
          remote: {
            url: `http://localhost:${fakeI18nBackend.port}/xxxxx/{{ns}}/{{lang}}`,
          },
          srcPaths: [path.resolve('.\\samples\\case_01\\src')],
        });

        try {
          await audit.initializeAsync();
          assert.fail('No way, this audit must throw an error.');
        } catch (error) {
          if (error.message !== 'Invalid HTTP response: Not Found (http://localhost:8085/xxxxx/EASY/en).') {
            throw error;
          }
        }
      });

      it('Good backend', async () => {
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

      it('Good backend - empty i18n data', async () => {
        const audit = new I18NAudit({
          i18nConfig: {
            namespaces: ['EASY'],
            languages: ['en', 'fr'],
          },
          remote: {
            url: `http://localhost:${fakeI18nBackend.port}/i18n_bad/{{ns}}/{{lang}}`,
          },
          srcPaths: [path.resolve('.\\samples\\case_03\\src')],
        });

        await audit.initializeAsync();
        const details = await audit.validateAsync();
        assert.strictEqual(details.isOk, false);
        assert.strictEqual(details.languages.length, 2);
        assert.strictEqual(Object.keys(details.missingKeys).length, 6);
      });

      it('Good backend - nothing', async () => {
        const audit = new I18NAudit({
          i18nConfig: {
            namespaces: ['EASY'],
            languages: ['en', 'fr'],
          },
          remote: {
            url: `http://localhost:${fakeI18nBackend.port}/i18n/{{ns}}/{{lang}}`,
          },
          srcPaths: [path.resolve('.\\samples\\case_02\\src')],
        });

        await audit.initializeAsync();
        const details = await audit.validateAsync();
        assert.strictEqual(details.isOk, false);
        assert.strictEqual(details.languages.length, 2);
        assert.strictEqual(Object.keys(details.missingKeys).length, 0);
      });
    });
  });
});
