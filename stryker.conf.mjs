'use strict';

// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: ['./test/fixtures/**/*.[cm]js'],
  packageManager: 'npm',
  reporters: ['html', 'json', 'clear-text', 'progress'],
  testRunner: 'command',
  commandRunner: { command: 'npm run test:generate' },
  coverageAnalysis: 'all',
  ignorers: ['ignore-meta'],
  plugins: ['@stryker-mutator/*', './src/index.mjs'],
};
