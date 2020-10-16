import * as c from 'ansi-colors';
import * as commandLineArgs from 'command-line-args';
import { CLIReporter } from './i18n/cli-reporter';

const optionDefinitions = [
  { name: 'src', type: String, multiple: true },
  { name: 'i18n', type: String, multiple: true },
  { name: 'lang', type: String, multiple: true },
  { name: 'namespace', type: String, multiple: true },
  { name: 'ignore-keys', type: String },
  { name: 'namespace-sep', type: String },
  { name: 'nested-sep', type: String },
  { name: 'reporter', type: String, multiple: true },
  /** mode : 'audit' */
  { name: 'mode', type: String },
  { name: 'output', alias: 'o', type: String },
  { name: 'level', alias: 'l', type: Number },
  { name: 'discovery', alias: 'd', type: Boolean },
];

// eslint-disable-next-line @typescript-eslint/no-var-requires
console.log(c.bold.underline.blueBright(`[i18n] @creadigme/au-i18n-audit v${require('./../package.json').version}.`));

const options = commandLineArgs(optionDefinitions);

CLIReporter.cliAsync({
  srcPaths: options.src,
  local: {
    i18nPaths: options.i18n,
  },
  reporters: options.reporter,
  mode: options.mode,
  output: options.output,
  ignoreKeys: options['ignore-keys'] ? new RegExp(options['ignore-keys']) : undefined,
  level: options.level,
  i18nConfig: {
    autoDiscovery: options.discovery,
    languages: options.lang || [],
    namespaces: options.namespace || [],
    nsSeparator: options['namespace-sep'] || undefined,
    nestedSeparator: options['nested-sep'] || undefined,
  },
})
  .then(isOk => {
    process.exit(isOk ? 0 : 1);
  })
  .catch(err => {
    console.log(c.red(`[i18n] ${err.message}.`));
    process.exit(1);
  });
