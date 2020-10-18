import * as c from 'ansi-colors';
import { II18NAuditResults } from '../i-i18n-audit-results';
import { IReporter } from './i-reporter';

/**
 * Console reporter
 */
export class ConsoleReporter implements IReporter {
  constructor(private _onlySummary: boolean = false) {}

  public async reportAsync(details: II18NAuditResults) {
    console.log(c.green(`[i18n] ${details.languages.length} languages detected (${details.languages.join(', ')}).`));

    if (details.unused.length) {
      console.log(c.bold.yellow(`[i18n] ${details.unused.length} keys seems not to be used (maybe server side?).`));
      if (!this._onlySummary) {
        console.log(c.yellow(`\t${details.unused.join('\n\t')}\n`));
      }
    }

    if (details.missingKeys.length) {
      console.log(c.bold.red(`[i18n] ${details.missingKeys.length} keys are not defined.`));
      if (!this._onlySummary) {
        details.missingKeys.forEach(f => {
          console.log(c.red(`\t${f.key}`));
          console.log(c.yellow(`\t\t- ${f.sources.join('\n\t\t- ')}`));
        });
        console.log('');
      }
    }

    if (details.missingLangs.length) {
      console.log(c.bold.red(`[i18n] ${details.missingLangs.length} keys do not have all the languages translated.`));
      if (!this._onlySummary) {
        console.log(c.red(`\t${details.missingLangs.map(f => `${f.key} (${f.langs.join(', ')})`).join('\n\t')}\n`));
      }
    }
  }
}
