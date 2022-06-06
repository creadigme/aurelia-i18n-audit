/* eslint-disable @typescript-eslint/no-var-requires */
const nodeExternals = require('webpack-node-externals');
const configurator = require('./.build/webpack.node.configurator');

module.exports = [
  configurator({
    org: 'creadigme',
    name: 'au-i18n-audit',
    directory: __dirname,
    target: 'node',
    libraryType: 'commonjs',
    externals: [nodeExternals({})],
    plugins: [],
  }),
];
