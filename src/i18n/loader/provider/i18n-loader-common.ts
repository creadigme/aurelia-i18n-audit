export interface IRemoteOptions {
  /** 'http://localhost:3333/api/i18n/{{ns}}/{{lang}}' */
  url: string;
}

export interface ILocalOptions {
  /** Paths  */
  i18nPaths: string[];
  /** Allows to retrieve the namespace and language name from the file path */
  i18nNSResolver?: (filePath: string) => { ns: string; lang: string };
  /**
   * Mode
   *
   * @default `tree`
   *
   * `tree`: ./i18n/{{lang}}/{{namespace}}.{{json|yml|yaml}}
   *
   * `root`: ./i18n/{{lang}}.{{json|yml|yaml}}
   */
  mode?: 'tree' | 'root';
}

export interface I18NKeys {
  [ns: string]: {
    /** Languages */
    [key: string]: {
      [lang: string]: string;
    };
  };
}

/**
 * Add new ns/key or/and add new language
 */
export function ensureTrans(definedKeys: I18NKeys, ns: string, key: string, language: string, value: string) {
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
