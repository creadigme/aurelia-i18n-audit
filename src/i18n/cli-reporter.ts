import * as c from 'ansi-colors';
import { I18NAudit } from './i18n-audit';
import { I18NAuditOptions } from './i18n-audit-options';
import { ConsoleReporter } from './reporter/console-reporter';
import { IReporter } from './reporter/i-reporter';
import { CSVReporter } from './reporter/csv-reporter';

/** CLI */
export class CLIReporter {
  private static readonly _REPORTERS: {
    [reporterName: string]: (audit?: I18NAudit) => IReporter;
  } = {
    summary: () => new ConsoleReporter(true),
    text: () => new ConsoleReporter(),
    csv: (audit: I18NAudit) => new CSVReporter(audit),
    xls: (audit: I18NAudit) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return new (require('./reporter/xls-reporter').XLSReporter)(audit);
      } catch (err) {
        console.log(c.red(`[i18n] ERROR - Misuse? 'xls' reporter needs 'exceljs' dependency:`));
        console.log(c.red(`[i18n] 'exceljs' is a peerDependency. "npm i exceljs@^4 --save-dev"`));
        throw err;
      }
    },
  };

  public static async cliAsync(
    options: I18NAuditOptions & {
      /** Summary ? */
      reporters?: Array<'summary' | 'text' | 'csv' | 'xls'>;
      mode?: 'audit' | 'export' | 'import';
      output?: string;
    }
  ): Promise<boolean> {
    if (!options.mode) {
      options.mode = 'audit';
    }
    const audit = new I18NAudit(options);

    // Load i18n translations
    await audit.initializeAsync();

    // Browse sources & get details
    if (options.mode === 'audit') {
      const details = await audit.validateAsync();

      if (options.reporters) {
        for (let i = 0; i < options.reporters.length; i++) {
          if (options.reporters[i] in CLIReporter._REPORTERS) {
            await CLIReporter._REPORTERS[options.reporters[i]](audit).reportAsync(details, options);
          } else {
            throw new Error(`Invalid reporter: ${options.reporters[i]}.`);
          }
        }
      }

      return details.isOk;
    } else {
      // Future
      return false;
    }
  }
}
