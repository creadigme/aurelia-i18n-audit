import * as path from 'path';
import { PathUtils } from '../utils/path-utils';
import { ELevel } from './e-level';
import { II18NConfig } from './i-i18n-config';
import { ILocalOptions, IRemoteOptions } from './i18n-loader';

export class I18NAuditOptions {
  private _isInit?: boolean = false;

  /** I18N Configuration */
  public i18nConfig?: II18NConfig;
  /** Sources directories */
  public srcPaths: string[];
  /** Ignore list (regexp) (allows to ignore some keys) */
  public ignoreKeys?: RegExp;
  /** If the i18n translations are in a local directory */
  public local?: ILocalOptions;
  /**
   * If the i18ns have to be loaded from a remote API :
   * - It is necessary to specify the namespaces
   * - Supported languages
   * - The url with the keywords {{ns}} and {{lang}}
   */
  public remote?: IRemoteOptions;
  /** Audit level */
  public level?: ELevel;

  constructor(options?: I18NAuditOptions) {
    if (options) {
      if (options._isInit) {
        Object.assign(this, options);
      } else {
        this.srcPaths = options.srcPaths?.map(f => PathUtils.forwardSlash(path.join(f, `/**/!(*.spec).{ts,html}`))) || [];
        this.ignoreKeys = options.ignoreKeys;
        this.level = options.level || ELevel.MEDIUM;
        this.local = options.local;
        this.remote = options.remote;
        this.i18nConfig = options.i18nConfig || {};

        if (!this.i18nConfig.nsSeparator) {
          this.i18nConfig.nsSeparator = ':';
        }
        if (!this.i18nConfig.nestedSeparator) {
          this.i18nConfig.nestedSeparator = '.';
        }
        if (this.i18nConfig.attributes?.length === 0) {
          this.i18nConfig.attributes = ['t'];
        }
      }
    }
  }
}
