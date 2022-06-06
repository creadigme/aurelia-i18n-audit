import { I18NAudit } from './i18n-audit';
import { I18NAuditOptions } from './i18n-audit-options';
import { ConsoleReporter } from './reporter/console-reporter';
import { IReporter } from './reporter/i-reporter';
import { CSVReporter } from './reporter/csv-reporter';
import { XLSReporter } from './reporter/xls-reporter';

/** CLI */
export class CLIReporter {
  private static readonly _REPORTERS: {
    [reporterName: string]: (audit?: I18NAudit) => IReporter<unknown>;
  } = {
    summary: () => new ConsoleReporter(false),
    text: () => new ConsoleReporter(true),
    csv: (audit: I18NAudit) => new CSVReporter(audit),
    xls: (audit: I18NAudit) => new XLSReporter(audit),
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
    switch (options.mode) {
      case 'audit':
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
      case 'import':
      case 'export':
        // Future
        return false;
      default:
        throw new Error(`Invalid mode: ${options.mode}`);
    }
  }
}
