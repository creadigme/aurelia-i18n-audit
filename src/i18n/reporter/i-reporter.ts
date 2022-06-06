import { II18NAuditResults } from '../i-i18n-audit-results';

/** Reporter interface */
export interface IReporter<O = void> {
  reportAsync(
    details: II18NAuditResults,
    options?: {
      output?: string;
    }
  ): Promise<O>;
}
