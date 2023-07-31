import * as assert from 'node:assert';
import * as os from 'node:os';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { exec } from 'node:child_process';
import * as fs from 'fs-extra';
import * as ExcelJS from 'exceljs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('./../package.json').version;

describe('cli', () => {
  describe('import/export (not implemented)', () => {
    it('mode import', async () => {
      const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--mode', 'import');
      assert.strictEqual(res.exitCode, 1);
      assert.strictEqual(res.stdout, `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m\n`);
    });

    it('mode export', async () => {
      const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--mode', 'import');
      assert.strictEqual(res.exitCode, 1);
      assert.strictEqual(res.stdout, `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m\n`);
    });

    it('mode unknown', async () => {
      const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--mode', 'unknown');
      assert.strictEqual(res.exitCode, 1);
      assert.strictEqual(res.stdout, `\x1B[1m\x1B[4m\x1B[94m[i18n] @creadigme/au-i18n-audit v${version}.\x1B[39m\x1B[24m\x1B[22m\n\x1B[31m[i18n] Invalid mode: unknown.\x1B[39m\n`);
    });
  });

  describe('audit', () => {
    it('No argument', async () => {
      const res = await testCLIAsync();
      assert.strictEqual(res.exitCode, 0);
      assert.strictEqual(res.stdout, `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m\n`);
    });

    it('reporter none', async () => {
      const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n');
      assert.strictEqual(res.exitCode, 1);
      assert.strictEqual(res.stdout, `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m\n`);
    });

    it('reporter summary', async () => {
      const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--reporter', 'summary');
      assert.strictEqual(res.exitCode, 1);
      assert.strictEqual(
        res.stdout,
        `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m\n\u001b[32m[i18n] 1 languages detected (fr).\u001b[39m\n\u001b[1m\u001b[33m[i18n] 1 keys seems not to be used (maybe server side?).\u001b[39m\u001b[22m\n\u001b[1m\u001b[31m[i18n] 3 keys are not defined.\u001b[39m\u001b[22m\n`
      );
    });

    it('reporter summary, default ns', async () => {
      const res = await testCLIAsync('--src', './samples/case_06/src/', '--i18n', './samples/case_06/i18n', '--default-ns', 'EASY', '--reporter', 'summary');
      assert.strictEqual(res.exitCode, 1);
      assert.strictEqual(
        res.stdout,
        `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m\n\u001b[32m[i18n] 1 languages detected (fr).\u001b[39m\n\u001b[1m\u001b[33m[i18n] 5 keys seems not to be used (maybe server side?).\u001b[39m\u001b[22m\n\u001b[1m\u001b[31m[i18n] 3 keys are not defined.\u001b[39m\u001b[22m\n`
      );
    });

    it('reporter text', async () => {
      const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--reporter', 'text');
      assert.strictEqual(res.exitCode, 1);
      assert.deepStrictEqual(res.stdout.split('\n'), [
        `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m`,
        '\u001b[32m[i18n] 1 languages detected (fr).\u001b[39m',
        '\u001b[1m\u001b[33m[i18n] 1 keys seems not to be used (maybe server side?).\u001b[39m\u001b[22m',
        '\u001b[33m\tEASY:NOT_USED\u001b[39m',
        '\u001b[33m\u001b[39m',
        '\u001b[1m\u001b[31m[i18n] 3 keys are not defined.\u001b[39m\u001b[22m',
        '\u001b[31m\tEASY:KEY2\u001b[39m',
        '\u001b[33m\t\t- samples/case_01/src/sample.html:9:40\u001b[39m',
        '\u001b[33m\t\t- samples/case_01/src/sample.html:15:38\u001b[39m',
        '\u001b[31m\tEASY:KEY\u001b[39m',
        '\u001b[33m\t\t- samples/case_01/src/sample.html:8:40\u001b[39m',
        '\u001b[33m\t\t- samples/case_01/src/sample.html:14:38\u001b[39m',
        '\u001b[31m\tEASY:MIDDLE\u001b[39m',
        '\u001b[33m\t\t- samples/case_01/src/sample.ts:19:21\u001b[39m',
        '',
        '',
      ]);
    });

    it('reporter text - missing languages', async () => {
      const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--reporter', 'text', '--lang', 'fr', '--lang', 'en');
      assert.strictEqual(res.exitCode, 1);
      assert.deepStrictEqual(res.stdout.split('\n'), [
        `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m`,
        '\u001b[32m[i18n] 2 languages detected (fr, en).\u001b[39m',
        '\u001b[1m\u001b[33m[i18n] 1 keys seems not to be used (maybe server side?).\u001b[39m\u001b[22m',
        '\u001b[33m\tEASY:NOT_USED\u001b[39m',
        '\u001b[33m\u001b[39m',
        '\u001b[1m\u001b[31m[i18n] 3 keys are not defined.\u001b[39m\u001b[22m',
        '\u001b[31m\tEASY:KEY2\u001b[39m',
        '\u001b[33m\t\t- samples/case_01/src/sample.html:9:40\u001b[39m',
        '\u001b[33m\t\t- samples/case_01/src/sample.html:15:38\u001b[39m',
        '\u001b[31m\tEASY:KEY\u001b[39m',
        '\u001b[33m\t\t- samples/case_01/src/sample.html:8:40\u001b[39m',
        '\u001b[33m\t\t- samples/case_01/src/sample.html:14:38\u001b[39m',
        '\u001b[31m\tEASY:MIDDLE\u001b[39m',
        '\u001b[33m\t\t- samples/case_01/src/sample.ts:19:21\u001b[39m',
        '',
        '\u001b[1m\u001b[31m[i18n] 4 keys do not have all the languages translated.\u001b[39m\u001b[22m',
        '\u001b[31m\tEASY:STOP (en)\u001b[39m',
        '\u001b[31m\tEASY:START (en)\u001b[39m',
        '\u001b[31m\tEASY:PAUSE (en)\u001b[39m',
        '\u001b[31m\tEASY:NOT_USED (en)\u001b[39m',
        '\u001b[31m\u001b[39m',
        '',
      ]);
    });

    it('reporter csv', async () => {
      const tmpCsv = path.join(os.tmpdir(), `${crypto.randomBytes(16).toString('hex')}.csv`);

      try {
        const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--reporter', 'csv', '--output', `"${tmpCsv}"`);
        assert.strictEqual(res.exitCode, 1);
        assert.strictEqual(res.stdout.split('\n')[0], `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m`);
        const csvData = fs.readFileSync(tmpCsv, {
          encoding: 'utf8',
        });
        assert.deepStrictEqual(csvData.replace(/\r\n/g, '\n').split('\n'), [
          'Key;New;Used;"fr"',
          '"EASY:STOP";false;true;"Stop"',
          '"EASY:START";false;true;"Start"',
          '"EASY:PAUSE";false;true;"Pause"',
          '"EASY:NOT_USED";false;false;"Another One"',
          '"EASY:KEY2";true;true;',
          '"EASY:KEY";true;true;',
          '"EASY:MIDDLE";true;true;',
          '',
        ]);
      } finally {
        fs.unlinkSync(tmpCsv);
      }
    });

    it('reporter csv - without output (thus process.cwd)', async () => {
      const tmpCsv = path.join(process.cwd(), 'i18n_report.csv');

      try {
        const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--reporter', 'csv');
        assert.strictEqual(res.exitCode, 1);
        assert.strictEqual(res.stdout.split('\n')[0], `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m`);
        const csvData = fs.readFileSync(tmpCsv, {
          encoding: 'utf8',
        });
        assert.deepStrictEqual(csvData.replace(/\r\n/g, '\n').split('\n'), [
          'Key;New;Used;"fr"',
          '"EASY:STOP";false;true;"Stop"',
          '"EASY:START";false;true;"Start"',
          '"EASY:PAUSE";false;true;"Pause"',
          '"EASY:NOT_USED";false;false;"Another One"',
          '"EASY:KEY2";true;true;',
          '"EASY:KEY";true;true;',
          '"EASY:MIDDLE";true;true;',
          '',
        ]);
      } finally {
        fs.unlinkSync(tmpCsv);
      }
    });

    it('reporter csv - without filename', async () => {
      const tmpCsvDir = path.join(os.tmpdir(), `${crypto.randomBytes(16).toString('hex')}`);
      const tmpCsv = path.join(tmpCsvDir, 'i18n_report.csv');

      try {
        const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--reporter', 'csv', '--output', `"${tmpCsvDir}"`);
        assert.strictEqual(res.exitCode, 1);
        assert.strictEqual(res.stdout.split('\n')[0], `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m`);
        const csvData = fs.readFileSync(tmpCsv, {
          encoding: 'utf8',
        });
        assert.deepStrictEqual(csvData.replace(/\r\n/g, '\n').split('\n'), [
          'Key;New;Used;"fr"',
          '"EASY:STOP";false;true;"Stop"',
          '"EASY:START";false;true;"Start"',
          '"EASY:PAUSE";false;true;"Pause"',
          '"EASY:NOT_USED";false;false;"Another One"',
          '"EASY:KEY2";true;true;',
          '"EASY:KEY";true;true;',
          '"EASY:MIDDLE";true;true;',
          '',
        ]);
      } finally {
        fs.unlinkSync(tmpCsv);
        fs.rmSync(tmpCsvDir, {
          recursive: true,
        });
      }
    });

    it('reporter xls', async () => {
      const tmpXlsx = path.join(os.tmpdir(), `${crypto.randomBytes(16).toString('hex')}.xlsx`);

      try {
        const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--reporter', 'xls', '--output', `"${tmpXlsx}"`);
        assert.strictEqual(res.exitCode, 1);
        assert.strictEqual(res.stdout.split('\n')[0], `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m`);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(tmpXlsx);
        assert.strictEqual(workbook.worksheets.length, 1);
        assert.strictEqual(workbook.worksheets[0].name, 'EASY');
        assert.strictEqual(workbook.worksheets[0].rowCount, 8);
        assert.strictEqual(workbook.worksheets[0].columnCount, 4);
      } finally {
        fs.unlinkSync(tmpXlsx);
      }
    });

    it('reporter xls - no i18n at all', async () => {
      const tmpXlsx = path.join(os.tmpdir(), `${crypto.randomBytes(16).toString('hex')}.xlsx`);

      try {
        const res = await testCLIAsync('--src', './samples/case_02/src/', '--i18n', './samples/case_02/i18n', '--reporter', 'xls', '--output', `"${tmpXlsx}"`);
        assert.strictEqual(res.exitCode, 0);
        assert.strictEqual(res.stdout.split('\n')[0], `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m`);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(tmpXlsx);
        assert.strictEqual(workbook.worksheets.length, 0);
      } finally {
        if (fs.existsSync(tmpXlsx)) {
          fs.unlinkSync(tmpXlsx);
        }
      }
    });

    it('reporter xls - no i18n repo', async () => {
      const tmpXlsx = path.join(os.tmpdir(), `${crypto.randomBytes(16).toString('hex')}.xlsx`);

      try {
        const res = await testCLIAsync('--namespace', 'EASY', '--src', './samples/case_03/src/', '--i18n', './samples/case_03/i18n', '--reporter', 'xls', '--output', `"${tmpXlsx}"`);
        assert.strictEqual(res.exitCode, 1);
        assert.strictEqual(res.stdout.split('\n')[0], `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m`);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(tmpXlsx);
        assert.strictEqual(workbook.worksheets.length, 1);
        assert.strictEqual(workbook.worksheets[0].name, 'EASY');
        assert.strictEqual(workbook.worksheets[0].rowCount, 7);
        assert.strictEqual(workbook.worksheets[0].columnCount, 4);
      } finally {
        fs.unlinkSync(tmpXlsx);
      }
    });

    it('reporter xls - without output (thus cwd)', async () => {
      const tmpXlsx = path.join(process.cwd(), 'i18n_report.xlsx');

      try {
        const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--reporter', 'xls');
        assert.strictEqual(res.exitCode, 1);
        assert.strictEqual(res.stdout.split('\n')[0], `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m`);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(tmpXlsx);
        assert.strictEqual(workbook.worksheets.length, 1);
        assert.strictEqual(workbook.worksheets[0].name, 'EASY');
        assert.strictEqual(workbook.worksheets[0].rowCount, 8);
        assert.strictEqual(workbook.worksheets[0].columnCount, 4);
      } finally {
        fs.unlinkSync(tmpXlsx);
      }
    });

    it('reporter xls - without filename', async () => {
      const tmpXlsxDir = path.join(os.tmpdir(), `${crypto.randomBytes(16).toString('hex')}`);
      const tmpXlsx = path.join(tmpXlsxDir, 'i18n_report.xlsx');

      try {
        const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--reporter', 'xls', '--output', `"${tmpXlsxDir}"`);
        assert.strictEqual(res.exitCode, 1);
        assert.strictEqual(res.stdout.split('\n')[0], `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m`);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(tmpXlsx);
        assert.strictEqual(workbook.worksheets.length, 1);
        assert.strictEqual(workbook.worksheets[0].name, 'EASY');
        assert.strictEqual(workbook.worksheets[0].rowCount, 8);
        assert.strictEqual(workbook.worksheets[0].columnCount, 4);
      } finally {
        fs.unlinkSync(tmpXlsx);
        fs.rmSync(tmpXlsxDir, {
          recursive: true,
        });
      }
    });

    it('bad reporter', async () => {
      const res = await testCLIAsync('--src', './samples/case_01/src/', '--i18n', './samples/case_01/i18n', '--reporter', 'something');
      assert.strictEqual(res.exitCode, 1);
      assert.strictEqual(res.stdout, `\u001b[1m\u001b[4m\u001b[94m[i18n] @creadigme/au-i18n-audit v${version}.\u001b[39m\u001b[24m\u001b[22m\n\u001b[31m[i18n] Invalid reporter: something..\u001b[39m\n`);
    });
  });
});

type TestCLIResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
  err: Error;
};

function testCLIAsync(...args: string[]): Promise<TestCLIResult> {
  return new Promise<TestCLIResult>(resolve => {
    const res = exec(
      `node ./build/cli ${args.join(' ')}`,
      {
        cwd: process.cwd(),
      },
      (err, stdout, stderr) => {
        resolve({
          exitCode: res.exitCode,
          stdout,
          stderr,
          err,
        });
      }
    );
  });
}
