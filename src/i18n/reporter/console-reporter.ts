import * as c from 'ansi-colors';
import { II18NAuditResults } from '../i-i18n-audit-results';
import { IReporter } from './i-reporter';

/**
 * Console reporter
 */
export class ConsoleReporter implements IReporter<string[]> {
  constructor(private _verbose: boolean) {}

  public async reportAsync(details: II18NAuditResults) {
    const logs = [];
    logs.push(c.green(`[i18n] ${details.languages.length} languages detected (${details.languages.join(', ')}).`));

    if (details.unused.length) {
      logs.push(c.bold.yellow(`[i18n] ${details.unused.length} keys seems not to be used (maybe server side?).`));
      if (this._verbose) {
        logs.push(c.yellow(`\t${details.unused.join('\n\t')}\n`));
      }
    }

    if (details.missingKeys.length) {
      logs.push(c.bold.red(`[i18n] ${details.missingKeys.length} keys are not defined.`));
      if (this._verbose) {
        details.missingKeys.forEach(f => {
          logs.push(c.red(`\t${f.key}`));
          logs.push(c.yellow(`\t\t- ${f.sources.join('\n\t\t- ')}`));
        });
        logs.push('');
      }
    }

    if (details.missingLangs.length) {
      logs.push(c.bold.red(`[i18n] ${details.missingLangs.length} keys do not have all the languages translated.`));
      if (this._verbose) {
        logs.push(c.red(`\t${details.missingLangs.map(f => `${f.key} (${f.langs.join(', ')})`).join('\n\t')}\n`));
      }
    }

    console.log(logs.join('\n'));
    return logs;
  }
}
