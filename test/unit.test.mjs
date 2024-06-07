// @ts-check
import babelParser from '@babel/parser';
import babelTraverseModule from '@babel/traverse';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { it } from 'node:test';
import { strykerPlugins as sut } from '../src/index.mjs';
import dedent from 'dedent';
import { EOL } from 'node:os';

/** @type {typeof babelTraverseModule} */
// @ts-expect-error
const babelTraverse = babelTraverseModule.default;

const filePath = (name) => path.join(import.meta.dirname, 'fixtures', name);

const file = async (name) => {
  /** @type {import('@babel/parser').ParserOptions | undefined} */
  const opts = name.endsWith('mjs') ? { sourceType: 'module' } : undefined;

  const source = await fs.readFile(filePath(name), { encoding: 'utf-8' });
  return { input: babelParser.parse(source, opts), source };
};

const EXPECTED_IGNORE_MESSAGE = "Anything inside the 'meta' property of an ESLint rule definition can be ignored.";

const runExpecting = async (fileName, expectedIgnoredPart, canHaveIgnores) => {
  const { input, source } = await file(fileName);
  let actualIgnoredPart = '';
  babelTraverse(input, {
    enter(path) {
      const result = sut[0].value.shouldIgnore(path);

      if (result) {
        actualIgnoredPart = source.slice(path.node.start, path.node.end);
        if (canHaveIgnores) {
          assert.equal(result, EXPECTED_IGNORE_MESSAGE);
          path.stop();
        } else {
          throw new Error(`Did not expect to get any ignored part, but got one:${EOL}---${EOL}${actualIgnoredPart}---`);
        }
      }
    },
  });

  assert.equal(actualIgnoredPart, expectedIgnoredPart);
};

const runExpectingIgnoredPart = async (fileName, expectedIgnoredPart) =>
  runExpecting(fileName, expectedIgnoredPart, true);

const runExpectingNoIgnores = async (fileName) => runExpecting(fileName, '', false);

it('exports a Stryker plugin', async () => {
  assert.equal(sut.length, 1);
});

it('is called ignore-meta', () => {
  assert.equal(sut[0].name, 'ignore-meta');
});

it('is an ignorer', () => {
  assert.equal(sut[0].kind, 'Ignore');
});

it('ignores correctly in meta-export', async () => {
  await runExpectingIgnoredPart(
    'meta-export.cjs',
    dedent`
      exports.meta = {
        type: 'type',
        docs: {},
        schema: [],
      }`.replace(/\n/g, EOL),
  );
});

it('does not ignore anything in meta-object-wrong-type-type', async () => {
  await runExpectingNoIgnores('meta-object-wrong-type-type.mjs');
});

it('does not ignore anything in meta-object-wrong-docs-type', async () => {
  await runExpectingNoIgnores('meta-object-wrong-docs-type.mjs');
});

it('does not ignore anything in meta-object-wrong-schema-type', async () => {
  await runExpectingNoIgnores('meta-object-wrong-schema-type.mjs');
});

it('ignores correctly in meta-object', async () => {
  await runExpectingIgnoredPart(
    'meta-object.mjs',
    dedent`
      meta: {
          type: 'type',
          docs: {},
          schema: [],
        }`.replace(/\n/g, EOL),
  );
});

it('ignores correctly in meta-object-extra-props', async () => {
  await runExpectingIgnoredPart(
    'meta-object-extra-props.mjs',
    dedent`
      meta: {
          type: 'type',
          docs: {},
          schema: [],
          messages: {
            message1: 'abc',
          },
        }`.replace(/\n/g, EOL),
  );
});

it('does not ignore anything in meta-object-missing-type', async () => {
  await runExpectingNoIgnores('meta-object-missing-type.mjs');
});

it('does not ignore anything in meta-object-missing-docs', async () => {
  await runExpectingNoIgnores('meta-object-missing-docs.mjs');
});

it('does not ignore anything in meta-object-missing-schema', async () => {
  await runExpectingNoIgnores('meta-object-missing-schema.mjs');
});

it('does not ignore anything in no-meta', async () => {
  await runExpectingNoIgnores('no-meta.mjs');
});

it('does not ignore anything in export-same-properties-not-called-meta', async () => {
  await runExpectingNoIgnores('export-same-properties-not-called-meta.cjs');
});

it('does not ignore anything in object-same-properties-not-called-meta', async () => {
  await runExpectingNoIgnores('object-same-properties-not-called-meta.mjs');
});

it('does not ignore anything in meta-assignment-to-non-object', async () => {
  await runExpectingNoIgnores('meta-assignment-to-non-object.cjs');
});

it('does not ignore anything in meta-object-with-non-object', async () => {
  await runExpectingNoIgnores('meta-object-with-non-object.mjs');
});

it('does not ignore anything in meta-object-with-spread', async () => {
  await runExpectingNoIgnores('meta-object-with-spread.mjs');
});
