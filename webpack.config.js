const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = [
  {
    mode: 'production',
    entry: {
      audit: path.join(__dirname, './build/index.js'),
      'audit-cli': path.join(__dirname, './build/cli.js'),
    },
    target: 'node',
    node: {
      __dirname: false,
      __filename: false,
    },
    output: {
      path: path.join(__dirname, 'dist/'),
      filename: 'au-i18n-[name].js',
      libraryTarget: 'commonjs',
    },
    externals: [nodeExternals({})],
    plugins: [
      new webpack.BannerPlugin({
        banner: '#!/usr/bin/env node',
        raw: true,
      }),
    ],
    // devtool: 'sourcemap',
    resolve: {
      modules: ['./', 'node_modules'],
      alias: {
        '@creadigme/au-i18n-audit': 'build/',
      },
    },
  },
];
