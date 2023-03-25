import * as yaml from 'js-yaml';
import fg from 'fast-glob';
import * as fs from 'fs-extra';
import * as path from 'node:path';
import flattenImp from 'flat';
import { forwardSlash } from '../../../utils/forward-slash';
import { ensureTrans, type I18NKeys, type ILocalOptions } from './i18n-loader-common';

const flatten = flattenImp.default || flattenImp;

/**
 * Load translations from a local directory
 */
export async function fillLocalTreeI18nAsync(
  localOptions: ILocalOptions,
  data: {
    languages: string[];
    keys: I18NKeys;
  }
): Promise<void> {
  const options = {
    paths: localOptions.i18nPaths?.map(f => forwardSlash(path.join(f, '/**/*.{json,yml,yaml}'))) || [],
    nsResolver: localOptions.i18nNSResolver || _defaultI18nTreeNSResolver,
  };

  const jsonFiles = await fg(options.paths);
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
      ensureTrans(data.keys, ns, key, lang, transData[key]);
    });

    if (data.languages.indexOf(lang) === -1) {
      data.languages.push(lang);
    }
  }
}

/**
 * By default, one directory per language and one file per namespace
 */
function _defaultI18nTreeNSResolver(filePath: string) {
  return {
    ns: path.basename(filePath, path.extname(filePath)),
    lang: path.basename(path.dirname(filePath)),
  };
}
