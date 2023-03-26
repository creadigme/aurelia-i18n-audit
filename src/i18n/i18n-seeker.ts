import { II18NConfig } from './i-i18n-config';

export interface IRegexTagResult {
  ns?: string;
  key: string;
  subkeys?: string[];
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
        /** [xxx]ns:key.nested or ns:key.nested (get all the subkeys) */
        regex: new RegExp(`(\\[[\\w\\-]{0,}\\])?([\\w\\-]+)${ns}([\\w\\-]+(?:${key}[\\w\\-]+)*)`, 'i'),
        parse: result => {
          const keys = result.length > 3 ? result[3].split(key) : [];
          return {
            ns: result[2],
            key: keys[0],
            subkeys: keys.slice(1),
          };
        },
      },
      {
        /** [xxx]key.nested or key.nested (get all the subkeys) */
        regex: new RegExp(`(\\[[\\w\\-]{0,}\\])?([\\w\\-]+)${key}([\\w\\-]+(?:${key}[\\w\\-]+)*)`, 'i'),
        parse: result => {
          const keys = result.length > 3 ? result[3].split(key) : [];
          return {
            ns: null,
            key: result[2],
            subkeys: keys,
          };
        },
      },
      {
        /** [xxx]key key */
        regex: new RegExp(`(\\[[\\w\\-]{0,}\\])?([\\w\\-]+)`, 'i'),
        parse: result => {
          return {
            ns: null,
            key: result[2],
            subkeys: [],
          };
        },
      },
    ];

    this._i18nRegex = {
      /** Get NS & KEY */
      builtIn: [
        /** Converter 'XXX.YYYY' | t or 'XXX.YYYY'*/
        new RegExp(`'([\\w\\-${ns}${key}]{3,})' [\\|&] t\\b`, 'g'),
        /** Converter "XXX.YYYY" | t or "XXX.YYYY" & t*/
        new RegExp(`"([\\w\\-${ns}${key}]{3,})" [\\|&] t\\b`, 'g'),
        /** Attribute "t" t="XXX.YYYY" */
        new RegExp(`\\b[${attributes.join('')}]="([\\w\\-;\\]\\[${ns}${key}]{3,})"`, 'g'),
        /** Nested I18N $t(XXX.YY) **/
        new RegExp(`\\$t\\(([\\w\\-${ns}${key}]{3,})\\)`, 'g'),
        /** i18n.tr function .tr("xxx") */
        new RegExp(`\\.tr\\("([\\w\\-${ns}${key}]{3,})"`, 'g'),
        /** i18n.tr function .tr('xxx') */
        new RegExp(`\\.tr\\('([\\w\\-${ns}${key}]{3,})'`, 'g'),
      ],
      /** Custom RegExps */
      custom: this._options.customMatchers,
      /** Discovery mode */
      discovery: this._options.autoDiscovery
        ? namespaces.map(namespace => {
            return new RegExp(`['"](${namespace}${ns}[\\w\\-${key}]{3,})['"]`, 'g');
          })
        : [],
    };
  }

  /**
   * Search I18N keys, the callback is called for each key found
   * @param content file content
   * @param ext file extension (.ts, .js, .html)
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
    if (this._i18nRegex.discovery.length) {
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

      if (ext === '.ts' || ext === '.js') {
        const commIdx = lastLine.indexOf('//');
        isInComment = !!(commIdx !== -1 && commIdx < colPos);
      }

      // If no comment just before
      if (!isInComment && m.length > 1 && m[1]) {
        m[1].split(';').forEach(f => {
          const goodRegex = this._i18nRegexTag.find(reg => reg.regex.test(f));
          if (goodRegex) {
            goodRegex.regex.lastIndex = -1;
            const nsKeySub = goodRegex.regex.exec(f);
            if (nsKeySub.length) {
              callback(goodRegex.parse(nsKeySub), linePos, colPos);
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
