// @ts-check
import assert from 'assert';
import { test } from 'node:test';

// All these tests should pass. They are actually only in place so that Stryker finds no surviving mutants.

test('meta-export', async () => {
  const sut = await import('./fixtures/meta-export.cjs');
  assert(sut.meta.type === 'type');
});

test('meta-object-wrong-type-type', async () => {
  const sut = await import('./fixtures/meta-object-wrong-type-type.mjs');
  assert(sut.default.meta.type === 987 && sut.default.meta.schema.length === 0);
});

test('meta-object-wrong-docs-type', async () => {
  const sut = await import('./fixtures/meta-object-wrong-docs-type.mjs');
  assert(sut.default.meta.type === 'type' && sut.default.meta.docs === 'docs' && sut.default.meta.schema.length === 0);
});

test('meta-object-wrong-schema-type', async () => {
  const sut = await import('./fixtures/meta-object-wrong-schema-type.mjs');
  assert(sut.default.meta.type === 'type' && Object.keys(sut.default.meta.schema).length === 0);
});

test('meta-object', async () => {
  const sut = await import('./fixtures/meta-object.mjs');
  assert(sut.default.meta.type === 'type');
});

test('meta-object-extra-props', async () => {
  const sut = await import('./fixtures/meta-object-extra-props.mjs');
  assert(sut.default.meta.type === 'type');
});

test('meta-object-missing-type', async () => {
  const sut = await import('./fixtures/meta-object-missing-type.mjs');
  assert(sut.default.meta.schema.length === 0);
});

test('meta-object-missing-docs', async () => {
  const sut = await import('./fixtures/meta-object-missing-docs.mjs');
  assert(sut.default.meta.type === 'type');
  assert(sut.default.meta.schema.length === 0);
});

test('meta-object-missing-schema', async () => {
  const sut = await import('./fixtures/meta-object-missing-schema.mjs');
  assert(sut.default.meta.type === 'type');
});

test('no-meta', async () => {
  const sut = await import('./fixtures/no-meta.mjs');
  assert(sut.x.y.length === 0);
});

test('export-same-properties-not-called-meta', async () => {
  const sut = await import('./fixtures/export-same-properties-not-called-meta.cjs');
  assert(sut.other.type === 'type');
  assert(sut.other.schema.length === 0);
});

test('object-same-properties-not-called-meta', async () => {
  const sut = await import('./fixtures/object-same-properties-not-called-meta.mjs');
  assert(sut.default.other.type === 'type');
  assert(sut.default.other.schema.length === 0);
});

test('meta-assignment-to-non-object', async () => {
  const sut = await import('./fixtures/meta-assignment-to-non-object.cjs');
  assert(sut.default.meta[0].type === 'type');
  assert(sut.default.meta[0].schema.length === 0);
});

test('meta-object-with-non-object', async () => {
  const sut = await import('./fixtures/meta-object-with-non-object.mjs');
  assert(sut.default.meta[0].type === 'type');
  assert(sut.default.meta[0].schema.length === 0);
});
