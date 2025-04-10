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
        root: [resolve(__dirname, 'node_modules')],
        alias: {
          'website-examples': resolve(__dirname, '../examples/website'),
          'a5': resolve(__dirname, '../modules/'),
          'a5-internal': resolve(__dirname, '../modules/internal/')
        }
      }
    ]
  ]
};
