import * as yaml from 'js-yaml';
import { interpolate } from '../utils/interpolate';
import flattenImp from 'flat';
import * as fg from 'fast-glob';
import * as fs from 'fs-extra';
import * as path from 'path';
import { forwardSlash } from '../utils/forward-slash';
import { II18NConfig } from './i-i18n-config';
import * as fetch from 'node-fetch';

const flatten = flattenImp.default || flattenImp;
export interface IRemoteOptions {
  /** 'http://localhost:3333/api/i18n/{{ns}}/{{lang}}' */
  url: string;
}

export interface ILocalOptions {
  /** Paths  */
  i18nPaths: string[];
  /** Allows to retrieve the namespace and language name from the file path */
  i18nNSResolver?: (filePath: string) => { ns: string; lang: string };
}

export interface I18NKeys {
  [ns: string]: {
    /** Languages */
    [key: string]: {
      [lang: string]: string;
    };
  };
}

export class I18NLoader {
  private _initData(i18nConfig: II18NConfig): {
    languages: string[];
    keys: I18NKeys;
  } {
    const data: {
      languages: string[];
      keys: I18NKeys;
    } = {
      languages: i18nConfig.languages || [],
      keys: {},
    };

    if (i18nConfig.namespaces?.length) {
      i18nConfig.namespaces.forEach(ns => {
        data.keys[ns] = {};
      });
    }

    return data;
  }

  /**
   * Load translations from a local directory or/and remote backend
   */
  public async getI18nAsync(
    i18nConfig: II18NConfig,
    options: {
      local?: ILocalOptions;
      remote?: IRemoteOptions;
    }
  ) {
    const data = this._initData(i18nConfig);

    if (options.local) {
      await this._fillLocalI18nAsync(options.local, data);
    }

    if (options.remote) {
      await this._fillRemoteI18nAsync(i18nConfig, options.remote, data);
    }

    return data;
  }
  /**
   * Load translations from a local directory
   */
  private async _fillLocalI18nAsync(
    localOptions: ILocalOptions,
    data: {
      languages: string[];
      keys: I18NKeys;
    }
  ): Promise<void> {
    const options = {
      paths: localOptions.i18nPaths?.map(f => forwardSlash(path.join(f, '/**/*.{json,yml}'))) || [],
      nsResolver: localOptions.i18nNSResolver || this._defaultI18nNSResolver,
    };

    const jsonFiles = await ((fg as any).default || fg)(options.paths);
    const resolver = options.nsResolver;

    for (let i = 0; i < jsonFiles.length; i++) {
      const jsonFilePath = jsonFiles[i];
      const ymlData = yaml.load(
        await fs.readFile(jsonFilePath, {
          encoding: 'utf8',
        })
      );
      // We flat the nested keys
      const transData: any = ymlData ? flatten(ymlData) : {};

      const { ns, lang } = resolver(jsonFilePath);

      Object.keys(transData).forEach(key => {
        this._ensureTrans(data.keys, ns, key, lang, transData[key]);
      });

      if (data.languages.indexOf(lang) === -1) {
        data.languages.push(lang);
      }
    }
  }

  /** Loads translations from a remote backend */
  private async _fillRemoteI18nAsync(
    i18nConfig: II18NConfig,
    options: IRemoteOptions,
    data: {
      languages: string[];
      keys: I18NKeys;
    }
  ): Promise<void> {
    const urlPattern = options.url;
    /** Urls */
    const urlsInfo: Array<{ url: string; ns: string; lang: string }> = [];

    i18nConfig.namespaces.forEach(ns => {
      i18nConfig.languages.forEach(lang => {
        urlsInfo.push({
          ns,
          lang,
          url: interpolate(urlPattern, {
            ns,
            lang,
          }),
        });
      });
    });

    for (let i = 0; i < urlsInfo.length; i++) {
      const { url, ns, lang } = urlsInfo[i];
      const jsonData = await fetch(url).then(res => {
        if (res.status >= 200 && res.status < 400) {
          return res.text();
        } else {
          throw new Error(`Invalid HTTP response: ${res.statusText} (${url}).`);
        }
      });

      // Nested keys are flatten
      const ymlData = yaml.load(jsonData);
      const transData: any = ymlData ? flatten(yaml.load(jsonData)) : {};

      Object.keys(transData).forEach(key => {
        this._ensureTrans(data.keys, ns, key, lang, transData[key]);
      });
    }
  }

  /**
   * Add new ns/key or/and add new language
   */
  private _ensureTrans(definedKeys: I18NKeys, ns: string, key: string, language: string, value: string) {
    if (!definedKeys[ns]) {
      definedKeys[ns] = {};
    }

    if (!definedKeys[ns][key]) {
      definedKeys[ns][key] = {};
    }

    if (!definedKeys[ns][key][language]) {
      definedKeys[ns][key][language] = value;
    }
  }

  /**
   * By default, one directory per language and one file per namespace
   */
  private _defaultI18nNSResolver(filePath: string) {
    return {
      ns: path.basename(filePath, path.extname(filePath)),
      lang: path.basename(path.dirname(filePath)),
    };
  }
}
