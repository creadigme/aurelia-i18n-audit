import * as path from 'path';
import * as c from 'ansi-colors';
import { II18NAuditResults } from '../i-i18n-audit-results';
import { IReporter } from './i-reporter';
import { I18NAudit } from '../i18n-audit';
import * as ExcelJS from 'exceljs';

/** XLSX Reporter */
export class XLSReporter implements IReporter {
  constructor(private readonly _audit: I18NAudit) {}

  public async reportAsync(
    details: II18NAuditResults,
    options?: {
      output?: string;
    }
  ) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = '@creadigme/au-i18n-audit';
    workbook.lastModifiedBy = '@creadigme/au-i18n-audit';
    workbook.created = new Date();
    workbook.modified = new Date();
    // Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;

    Object.keys(this._audit.existingKeys).forEach(ns => {
      this._addWorksheetForNS(details, workbook, ns);
    });

    const outputFilePath = path.join(path.resolve(options.output || process.cwd()), options.output?.endsWith('.xlsx') || options.output?.endsWith('.xls') ? undefined : 'i18n_report.xlsx');

    await workbook.xlsx.writeFile(outputFilePath);

    console.log(c.green(`[i18n] XSLX report available : "${outputFilePath}"`));
  }

  private _addWorksheetForNS(details: II18NAuditResults, workbook: ExcelJS.Workbook, ns: string) {
    const i18nConfig = this._audit.options.i18nConfig;
    const nsKeys = Object.keys(this._audit.existingKeys[ns]);
    const nsWithSep = `${ns}${i18nConfig.nsSeparator}`;
    const missingsKeys = details.missingKeys.filter(f => f.key.startsWith(nsWithSep));

    // if the NS is not empty
    if (nsKeys.length || missingsKeys.length) {
      // Create worksheets with headers and footers
      const sheet = workbook.addWorksheet(ns, {
        properties: {
          defaultColWidth: 45,
        },
      });

      const table = sheet.addTable({
        ref: 'A1',
        headerRow: true,
        totalsRow: false,
        name: ns,
        style: {
          theme: 'TableStyleMedium4',
          showRowStripes: true,
        },
        columns: [
          {
            name: 'Key',
          },
          {
            name: 'Is new',
          },
          {
            name: 'Used',
          },
        ].concat(
          details.languages.map(f => {
            return { name: f };
          })
        ),
        rows: [],
      });

      nsKeys.forEach(key => {
        const info = this._audit.existingKeys[ns][key];

        table.addRow([`${ns}${i18nConfig.nsSeparator}${key}`, false, this._audit.inCodeKeys[ns] ? !!this._audit.inCodeKeys[ns][key] : false].concat(details.languages.map(lang => info[lang] || '')), undefined);
      });

      missingsKeys.forEach(info => {
        table.addRow([info.key, true, true].concat(details.languages.map(() => '')), undefined);
      });

      table.commit();

      const lastRowNum = sheet.lastRow.number;
      const lastTableRowNum = lastRowNum;

      //Loop through all table's row
      for (let i = 0; i <= lastTableRowNum; i++) {
        const row = sheet.getRow(i);

        //Now loop through every row's cell and finally set alignment
        row.eachCell({ includeEmpty: true }, (cell, num) => {
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: num > 3 };
        });
      }
    }
  }
}
