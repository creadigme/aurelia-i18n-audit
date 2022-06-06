import * as yaml from 'js-yaml';
import fg from 'fast-glob';
import * as fs from 'fs-extra';
import * as path from 'path';
import flattenImp from 'flat';
import { forwardSlash } from '../../../utils/forward-slash';
import { ensureTrans, type I18NKeys, type ILocalOptions } from './i18n-loader-common';

const flatten = flattenImp.default || flattenImp;

/**
 * Load translations from a local directory
 */
export async function fillLocalRootI18nAsync(
  localOptions: ILocalOptions,
  data: {
    languages: string[];
    keys: I18NKeys;
  },
  defaultNS: string = 'translation'
): Promise<void> {
  const options = {
    paths: localOptions.i18nPaths?.map(f => forwardSlash(path.join(f, '/**/*.{json,yml,yaml}'))) || [],
  };

  const jsonFiles = await fg(options.paths);

  // Each json/yml is a language
  for (let i = 0; i < jsonFiles.length; i++) {
    const jsonFilePath = jsonFiles[i];
    const lang = path.basename(jsonFilePath, path.extname(jsonFilePath));
    const ymlData = yaml.load(
      await fs.readFile(jsonFilePath, {
        encoding: 'utf8',
      })
    );
    // We flat the nested keys

    const transData: any = ymlData ? flatten(ymlData) : {};

    Object.keys(transData).forEach(key => {
      ensureTrans(data.keys, defaultNS, key, lang, transData[key]);
    });

    if (data.languages.indexOf(lang) === -1) {
      data.languages.push(lang);
    }
  }
}
