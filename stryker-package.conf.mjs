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
  thresholds: { high: 90, low: 75, break: 100 },
  htmlReporter: {
    fileName: 'reports/mutation/package.html',
  },
};
