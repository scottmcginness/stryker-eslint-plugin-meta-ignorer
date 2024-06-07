import babelParser from '@babel/parser';
import babelTraverseModule from '@babel/traverse';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, it } from 'node:test';
import { strykerPlugins as sut } from '../src/index.mjs';

/** @type {typeof babelTraverseModule} */
const babelTraverse = babelTraverseModule.default;

const filePath = (name) => path.join(import.meta.dirname, 'fixtures', name);

const file = async (name) => babelParser.parse(await fs.readFile(filePath(name), { encoding: 'utf-8' }));

const run = async (node) => {
  return sut[0].value.shouldIgnore(node);
};

const EXPECTED_IGNORE_MESSAGE = "Anything inside the 'meta' property of an ESLint rule definition can be ignored.";

it('exports a Stryker plugin', async () => {
  assert(sut.length === 1);
});

it('ignores correctly in meta-export', async () => {
  const input = await file('meta-export.cjs');

  let path = null;

  babelTraverse(input, {
    AssignmentExpression(p) {
      path = p;
    },
  });

  assert.notEqual(path, null);
  const result = await run(path);

  assert.equal(result, EXPECTED_IGNORE_MESSAGE);
});
