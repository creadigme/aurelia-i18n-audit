import * as yaml from 'js-yaml';
import { MiniInterpolate } from '../utils/mini-interpolate';
import fetch from 'node-fetch';
import * as flatten from 'flat';
import * as fg from 'fast-glob';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PathUtils } from './../utils/path-utils';
import { II18NConfig } from './i-i18n-config';

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
  private constructor() {
    // Private
  }

  private static _initData(
    i18nConfig: II18NConfig
  ): {
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
   * Load translations from a local directory
   */
  public static async getLocalI18nAsync(
    i18nConfig: II18NConfig,
    localOptions: ILocalOptions
  ): Promise<{
    languages: string[];
    keys: I18NKeys;
  }> {
    const options = {
      paths: localOptions.i18nPaths?.map(f => PathUtils.forwardSlash(path.join(f, '/**/*.{json,yml}'))) || [],
      nsResolver: localOptions.i18nNSResolver || I18NLoader._defaultI18nNSResolver,
    };

    const data = I18NLoader._initData(i18nConfig);

    const jsonFiles = await fg(options.paths);
    const resolver = options.nsResolver;

    for (let i = 0; i < jsonFiles.length; i++) {
      const jsonFilePath = jsonFiles[i];
      // We flat the nested keys
      const transData: any = flatten(
        yaml.safeLoad(
          await fs.readFile(jsonFilePath, {
            encoding: 'utf8',
          })
        )
      );

      const { ns, lang } = resolver(jsonFilePath);

      Object.keys(transData).forEach(key => {
        I18NLoader._ensureTrans(data.keys, ns, key, lang, transData[key]);
      });

      if (data.languages.indexOf(lang) === -1) {
        data.languages.push(lang);
      }
    }

    return data;
  }

  /** Loads translations from a local directory */
  public static async getRemoteI18nAsync(
    i18nConfig: II18NConfig,
    options: IRemoteOptions
  ): Promise<{
    languages: string[];
    keys: I18NKeys;
  }> {
    const data = I18NLoader._initData(i18nConfig);

    const urlPattern = options.url;
    /** Urls */
    const urlsInfo: Array<{ url: string; ns: string; lang: string }> = [];

    i18nConfig.namespaces.forEach(ns => {
      i18nConfig.languages.forEach(lang => {
        urlsInfo.push({
          ns,
          lang,
          url: MiniInterpolate.interpolate(urlPattern, {
            ns,
            lang,
          }),
        });
      });
    });

    for (let i = 0; i < urlsInfo.length; i++) {
      const { url, ns, lang } = urlsInfo[i];
      const jsonData = await fetch(url)
        .then(res => res.text())
        .catch(() => null);

      if (jsonData) {
        // Nested keys are flatten
        const transData: any = flatten(yaml.safeLoad(jsonData));

        Object.keys(transData).forEach(key => {
          I18NLoader._ensureTrans(data.keys, ns, key, lang, transData[key]);
        });

        if (data.languages.indexOf(lang) === -1) {
          data.languages.push(lang);
        }
      }
    }

    return data;
  }

  /**
   * Add new ns/key or/and add new language
   */
  private static _ensureTrans(definedKeys: I18NKeys, ns: string, key: string, language: string, value: string) {
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
  private static _defaultI18nNSResolver(filePath: string) {
    return {
      ns: path.basename(filePath, path.extname(filePath)),
      lang: path.basename(path.dirname(filePath)),
    };
  }
}
