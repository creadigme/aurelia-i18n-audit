/**
 * Alexandre Genet ~ 2020
 *
 * Usage :
 *
 * ```typescript
 * const audit = new I18NAudit({
 *  srcPaths : './path/to/src',
 *  local : {
 *    i18nPaths : './path/to/i18n'
 *  }
 * });
 *
 * async () => {
 *  await audit.initializeAsync();
 *  const details = await audit.validateAsync();
 *
 *  console.dir(details);
 * }();
 * ```
 */

export { I18NAudit } from './i18n/i18n-audit';
