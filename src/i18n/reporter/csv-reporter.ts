import * as fs from 'fs-extra';
import * as c from 'ansi-colors';
import * as path from 'path';
import { II18NAuditResults } from '../i-i18n-audit-results';
import { IReporter } from './i-reporter';
import { I18NAudit } from '../i18n-audit';

/** CSV Reporter */
export class CSVReporter implements IReporter {
  constructor(private readonly _audit: I18NAudit) {}

  public async reportAsync(
    details: II18NAuditResults,
    options?: {
      output?: string;
    }
  ) {
    const i18nConfig = this._audit.options.i18nConfig;

    let csv = `Key;New;Used;${details.languages.map(header => `"${header}"`).join(';')}\r\n`;

    Object.keys(this._audit.existingKeys).forEach(ns => {
      Object.keys(this._audit.existingKeys[ns]).forEach(key => {
        const info = this._audit.existingKeys[ns][key];

        csv += `"${ns}${i18nConfig.nsSeparator}${key}";false;${this._audit.inCodeKeys[ns] ? !!this._audit.inCodeKeys[ns][key] : false};${details.languages.map(lang => `"${(info[lang] || '').replace(/"/g, '""')}"`).join(';')}\r\n`;
      });
    });

    details.missingKeys.forEach(info => {
      csv += `"${info.key}";true;true;${details.languages.map(() => '').join(';')}\r\n`;
    });

    const outputFilePath = path.join(path.resolve(options.output || process.cwd()), options.output?.endsWith('.csv') ? undefined : 'i18n_report.csv');

    console.log(c.green(`[i18n] CSV report available : "${outputFilePath}"`));

    return fs.writeFile(outputFilePath, csv, {
      encoding: 'utf8',
    });
  }
}
