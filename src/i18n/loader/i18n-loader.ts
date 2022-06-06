import type { II18NConfig } from '../i-i18n-config';
import type { I18NKeys, ILocalOptions, IRemoteOptions } from './provider/i18n-loader-common';
import { fillLocalRootI18nAsync } from './provider/local-root-i18n-loader';
import { fillLocalTreeI18nAsync } from './provider/local-tree-i18n-loader';
import { fillRemoteI18nAsync } from './provider/remote-i18n-loader';

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
      if (options.local.mode === 'root') {
        await fillLocalRootI18nAsync(options.local, data, i18nConfig.defaultNS);
      } else {
        await fillLocalTreeI18nAsync(options.local, data);
      }
    }

    if (options.remote) {
      await fillRemoteI18nAsync(i18nConfig, options.remote, data);
    }

    return data;
  }
}
