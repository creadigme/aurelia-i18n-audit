import * as yaml from 'js-yaml';
import * as fetch from 'node-fetch';
import flattenImp from 'flat';
import { interpolate } from '../../../utils/interpolate';
import type { II18NConfig } from '../../i-i18n-config';
import { ensureTrans, type I18NKeys, type IRemoteOptions } from './i18n-loader-common';
const flatten = flattenImp.default || flattenImp;

/** Loads translations from a remote backend */
export async function fillRemoteI18nAsync(
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
      ensureTrans(data.keys, ns, key, lang, transData[key]);
    });
  }
}
