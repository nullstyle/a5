// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

const {resolve} = require('path');

module.exports = {
  presets: ['@docusaurus/core/lib/babel/preset'],
  plugins: [
    // Ensure consistently hashed component classNames between environments (a must for SSR)
    'styled-components',
    [
      'module-resolver',
      {
        alias: {
          'website-examples': resolve(__dirname, '../examples/website'),
          'a5': resolve(__dirname, '../modules/'),
          'a5-internal': resolve(__dirname, '../modules/internal/')
        },
        resolvePath: (sourcePath, currentFile, opts) => {
          // First try to resolve from the website's node_modules
          try {
            return require.resolve(sourcePath, { paths: [resolve(__dirname, 'node_modules')] });
          } catch (e) {
            // If not found, try the default resolution
            return require.resolve(sourcePath);
          }
        }
      }
    ]
  ]
};
