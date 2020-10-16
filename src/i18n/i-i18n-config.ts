export interface II18NConfig {
  /** Custom attributes, default ["t"] */
  attributes?: string[];
  /** Namespace separator */
  nsSeparator?: string;
  /** Nested key separator */
  nestedSeparator?: string;
  /** Default namespace (if none, 'translation' is taken or the first found) */
  defaultNS?: string;
  /** Namespaces (if not specified, they are auto discovery) */
  namespaces?: string[];
  /** Languages (if not specified, they are auto discovery) */
  languages?: string[];
  /**
   * Find the keys with custom RegExps
   * @example [/\.trans\('([\w\-:\.]{3,})'\)/gi]
   */
  customMatchers?: RegExp[];
  /** If autoDiscover is `true`, we try to find all the keys of the known namespaces */
  autoDiscovery?: boolean;
}
