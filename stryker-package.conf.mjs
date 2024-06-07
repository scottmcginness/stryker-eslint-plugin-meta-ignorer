'use strict';

// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: ['./src/index.mjs'],
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'command',
  commandRunner: { command: 'npm run test:unit' },
  coverageAnalysis: 'all',
  htmlReporter: {
    fileName: 'reports/mutation/package.html',
  },
};
