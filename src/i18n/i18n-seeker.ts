import { II18NConfig } from './i-i18n-config';

export interface IRegexTagResult {
  ns?: string;
  key: string;
  subkey?: string;
}

/**
 * The purpose of this class is to find the translation keys in the source code.
 */
export class I18NSeeker {
  private _options: II18NConfig;

  /** Get ns & key  */
  private _i18nRegexTag: Array<{
    regex: RegExp;
    parse: (result: any[]) => IRegexTagResult;
  }>;

  private _i18nRegex: {
    builtIn: RegExp[];
    custom: RegExp[];
    discovery: RegExp[];
  };

  /** I18N separators can be changed */
  public initialize(options: II18NConfig, namespaces: string[] = []): void {
    if (!options.defaultNS) {
      if (namespaces.indexOf('translation') !== -1) {
        options.defaultNS = 'translation';
      } else {
        if (namespaces.length) {
          options.defaultNS = namespaces[0];
        }
      }
    }

    this._options = options;

    const attributes = this._options.attributes?.length ? this._options.attributes : ['t'];
    const ns = I18NSeeker._escapeRegExp(this._options.nsSeparator);
    const key = I18NSeeker._escapeRegExp(this._options.nestedSeparator);

    this._i18nRegexTag = [
      {
        /** [xxx]ns:key.nested or ns:key.nested */
        regex: new RegExp(`(\\[[\\w\\-]{0,}\\])?([\\w\\-]{1,})${ns}([\\w\\-]{1,})${key}([\\w\\-]{1,})`, 'i'),
        parse: result => {
          if (result?.length) {
            return {
              ns: result[2],
              key: result[3],
              subkey: result[4],
            };
          } else {
            return null;
          }
        },
      },
      {
        /** [xxx]ns:key or ns:key */
        regex: new RegExp(`(\\[[\\w\\-]{0,}\\])?([\\w\\-]{1,})${ns}([\\w\\-]{1,})`, 'i'),
        parse: result => {
          if (result?.length) {
            return {
              ns: result[2],
              key: result[3],
              subkey: null,
            };
          } else {
            return null;
          }
        },
      },
      {
        /** [xxx]key.nested or key.nested */
        regex: new RegExp(`(\\[[\\w\\-]{0,}\\])?([\\w\\-]{1,})${key}([\\w\\-]{1,})`, 'i'),
        parse: result => {
          if (result?.length) {
            return {
              ns: null,
              key: result[2],
              subkey: result[3],
            };
          } else {
            return null;
          }
        },
      },
      {
        /** [xxx]key or key */
        regex: new RegExp(`(\\[[\\w\\-]{0,}\\])?([\\w\\-]{1,})`, 'i'),
        parse: result => {
          if (result?.length) {
            return {
              ns: null,
              key: result[2],
              subkey: null,
            };
          } else {
            return null;
          }
        },
      },
    ];

    this._i18nRegex = {
      /** Get NS & KEY */
      builtIn: [
        /** Converter 'XXX.YYYY' | t or 'XXX.YYYY'*/
        new RegExp(`'([\\w\\-${ns}${key}]{3,})' [\\|&] t\\b`, 'gi'),
        /** Converter "XXX.YYYY" | t or "XXX.YYYY" & t*/
        new RegExp(`"([\\w\\-${ns}${key}]{3,})" [\\|&] t\\b`, 'gi'),
        /** Attribute "t" t="XXX.YYYY" */
        new RegExp(`\\b[${attributes.join('')}]="([\\w\\-;\\]\\[${ns}${key}]{3,})"`, 'gi'),
        /** Nested I18N $t(XXX.YY) **/
        new RegExp(`\\$t\\(([\\w\\-${ns}${key}]{3,})\\)`, 'gi'),
        /** i18n.tr function .tr("xxx") */
        new RegExp(`\\.tr\\("([\\w\\-${ns}${key}]{3,})"`, 'gi'),
        /** i18n.tr function .tr('xxx') */
        new RegExp(`\\.tr\\('([\\w\\-${ns}${key}]{3,})'`, 'gi'),
      ],
      /** Custom RegExps */
      custom: this._options.customMatchers,
      /** Discovery mode */
      discovery: this._options.autoDiscovery
        ? namespaces.map(namespace => {
            return new RegExp(`['"](${namespace}${ns}[\\w\\-${key}]{3,})['"]`, 'gi');
          })
        : [],
    };
  }

  /**
   * Search I18N keys, the callback is called for each key found
   * @param content file content
   * @param ext file extension (.ts, .html)
   * @param callback on found
   */
  public searchI18NKeys(content: string, ext: string, callback: (res: IRegexTagResult, linePos: number, colPos: number) => void) {
    /** Accurates i18n key */
    this._i18nRegex.builtIn.forEach(regex => {
      this._searchI18nWithRegex(content, ext, regex, callback);
    });

    /** Custom i18n key */
    if (this._i18nRegex.custom?.length) {
      this._i18nRegex.custom.forEach(regex => {
        this._searchI18nWithRegex(content, ext, regex, callback);
      });
    }

    /** Auto Discovery */
    if (this._i18nRegex.discovery?.length) {
      this._i18nRegex.discovery.forEach(regex => {
        this._searchI18nWithRegex(content, ext, regex, callback);
      });
    }
  }

  /** Search & Push i18n key */
  private _searchI18nWithRegex(content: string, ext: string, regex: RegExp, callback: (res: IRegexTagResult, linePos: number, colPos: number) => void) {
    regex.lastIndex = -1;
    let m;
    // tslint:disable-next-line:no-conditional-assignment
    while ((m = regex.exec(content)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      const lines = content.substring(0, m.index).split('\n');
      const linePos = lines.length;
      const lastLine: string = lines[linePos - 1];
      const colPos = lastLine.length;

      let isInComment: boolean = false;

      if (ext === '.ts') {
        const commIdx = lastLine.indexOf('//');
        isInComment = !!(commIdx !== -1 && commIdx < colPos);
      }

      // If no comment just before
      if (!isInComment && m.length > 1 && m[1]) {
        m[1].split(';').forEach(f => {
          const goodRegex = this._i18nRegexTag.find(reg => reg.regex.test(f));
          if (goodRegex) {
            goodRegex.regex.lastIndex = -1;
            const rr = goodRegex.parse(goodRegex.regex.exec(f));
            if (rr) {
              callback(rr, linePos, colPos);
            }
          }
        });
      }
    }
  }

  /**
   * https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
   * coolaj86
   */
  private static _escapeRegExp(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
}
