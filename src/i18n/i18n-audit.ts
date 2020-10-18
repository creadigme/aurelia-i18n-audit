import * as path from 'path';
import * as fs from 'fs-extra';
import * as fg from 'fast-glob';
import { I18NAuditOptions } from './i18n-audit-options';

import { II18NAuditResults } from './i-i18n-audit-results';
import { ELevel } from './e-level';

import { I18NSeeker } from './i18n-seeker';
import { I18NLoader, I18NKeys } from './i18n-loader';

/**
 * I18N Audit
 */
export class I18NAudit {
  /** Langues */
  private _definedLanguages: string[] = [];
  /** Defined translations */
  private _definedKeys: I18NKeys = {};

  /** In code translation keys */
  private _inCodeKeys: {
    [ns: string]: {
      /** Source path */
      [key: string]: string[];
    };
  } = {};

  private readonly _options: I18NAuditOptions;
  private readonly _i18nSeeker: I18NSeeker;

  constructor(options: I18NAuditOptions) {
    this._options = new I18NAuditOptions(options);
    this._i18nSeeker = new I18NSeeker();
  }

  /** Load defined i18n keys */
  public async initializeAsync(): Promise<void> {
    let data: {
      languages: string[];
      keys: I18NKeys;
    } = {
      languages: [],
      keys: {},
    };

    data = await I18NLoader.getI18nAsync(this._options.i18nConfig, {
      local: this._options.local,
      remote: this._options.remote,
    });

    this._definedLanguages = data.languages;
    this._definedKeys = data.keys;

    this._i18nSeeker.initialize(this._options.i18nConfig, Object.keys(this._definedKeys));

    await this._browseSourcesAsync();
  }

  /**
   * Validate i18n usage
   */
  public validateAsync(): Promise<II18NAuditResults> {
    const details: II18NAuditResults = {
      languages: this._definedLanguages,
      unused: this._getUnsused(),
      missingKeys: this._getMissingKeys(),
      missingLangs: this._getMissingLangs(),
      isOk: false,
    };

    if (this._options.level === ELevel.EASY) {
      details.isOk = !details.missingLangs.length;
    } else if (this._options.level === ELevel.MEDIUM) {
      details.isOk = !(details.missingKeys.length || details.missingLangs.length);
    } else {
      details.isOk = !(details.unused.length || details.missingKeys.length || details.missingLangs.length);
    }

    return Promise.resolve(details);
  }

  /** Defined translations keys */
  public get existingKeys(): I18NKeys {
    return this._definedKeys;
  }

  /** In code translation keys */
  public get inCodeKeys(): {
    [ns: string]: {
      /** Source path */
      [key: string]: string[];
    };
  } {
    return this._inCodeKeys;
  }

  private _getMissingLangs() {
    const definedLanguages = this._definedLanguages;
    const definedKeys = this._definedKeys;

    const missed: Array<{ key: string; langs: string[] }> = [];
    Object.keys(definedKeys).forEach(ns => {
      Object.keys(definedKeys[ns]).forEach(key => {
        if (Object.keys(definedKeys[ns][key]).length !== definedLanguages.length) {
          const misingLangs = this._getMissingLang(Object.keys(definedKeys[ns][key]));
          if (misingLangs.length) {
            missed.push({
              key: this._formatNSKey(ns, key),
              langs: misingLangs,
            });
          }
        }
      });
    });

    return missed;
  }

  private _getMissingKeys() {
    const definedKeys = this._definedKeys;
    const missings: Array<{ key: string; sources: string[] }> = [];

    Object.keys(this._inCodeKeys).forEach(ns => {
      Object.keys(this._inCodeKeys[ns]).forEach(key => {
        if (!definedKeys[ns] || !definedKeys[ns][key]) {
          missings.push({
            key: this._formatNSKey(ns, key),
            sources: this._inCodeKeys[ns][key].map(f => `${f}`),
          });
        }
      });
    });

    return missings;
  }

  /** On vérifie les traductions non utilisées */
  private _getUnsused() {
    const notUseds: string[] = [];
    const definedKeys = this._definedKeys;

    Object.keys(definedKeys).forEach(ns => {
      Object.keys(definedKeys[ns]).forEach(key => {
        if (!this._inCodeKeys[ns] || !this._inCodeKeys[ns][key]) {
          notUseds.push(this._formatNSKey(ns, key));
        }
      });
    });

    return notUseds;
  }

  /** Browse sources */
  private async _browseSourcesAsync() {
    const tsFiles = await fg(this._options.srcPaths);
    for (let i = 0; i < tsFiles.length; i++) {
      const filePath = tsFiles[i];

      const ext = path.extname(filePath);

      const content = await fs.readFile(filePath, {
        encoding: 'utf8',
      });

      const defaultNS = this._options.i18nConfig.defaultNS;

      this._i18nSeeker.searchI18NKeys(content, ext, (rr, linePos, colPos) => {
        this._createOrUpdateInCodeKeys(rr.ns || defaultNS, rr.subkey ? `${rr.key}.${rr.subkey}` : rr.key, filePath, linePos, colPos);
      });
    }
  }

  private _formatNSKey(ns: string, key: string) {
    const keyFormated = key.replace(/\./g, this._options.i18nConfig.nestedSeparator);
    return ns ? `${ns}${this._options.i18nConfig.nsSeparator}${keyFormated}` : keyFormated;
  }

  private _createOrUpdateInCodeKeys(ns: string, key: string, location: string, linePos: number, colPos: number) {
    let ignore = false;
    if (this._options.ignoreKeys) {
      // Ignore keys
      ignore = this._options.ignoreKeys.test(this._formatNSKey(ns, key));
    }

    if (!ignore) {
      if (!this._inCodeKeys[ns]) {
        this._inCodeKeys[ns] = {};
      }

      if (!this._inCodeKeys[ns][key]) {
        this._inCodeKeys[ns][key] = [];
      }

      const locationWithLine = `${location}:${linePos}:${colPos}`;
      if (this._inCodeKeys[ns][key].indexOf(locationWithLine) === -1) {
        this._inCodeKeys[ns][key].push(locationWithLine);
      }
    }
  }

  /** Retrieve missing languages for a translation key */
  private _getMissingLang(langs: string[]): string[] {
    return this._definedLanguages.filter(existingLanguage => {
      return langs.indexOf(existingLanguage) === -1;
    });
  }

  /** Current options */
  public get options() {
    return this._options;
  }
}
