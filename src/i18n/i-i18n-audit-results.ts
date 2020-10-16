/** Audit results */
export interface II18NAuditResults {
  /** Languages */
  languages: string[];
  /** Unused keys */
  unused: string[];
  /** Missing keys  */
  missingKeys: Array<{
    key: string;
    sources: string[];
  }>;
  /** Keys with missing languages */
  missingLangs: Array<{
    key: string;
    langs: string[];
  }>;
  /** Validation OK */
  isOk: boolean;
}
