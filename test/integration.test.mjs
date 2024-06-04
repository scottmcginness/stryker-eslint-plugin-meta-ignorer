import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'assert';
import { test } from 'node:test';

const actual = async () => {
  const actualPath = path.join(import.meta.dirname, '../reports/mutation/mutation.json');
  try {
    return fs.readFile(actualPath, { encoding: 'utf-8' });
  } catch (e) {
    throw new Error(`Actual Stryker report at '${actualPath}' was missing.`);
  }
};

const snapshotPath = () => path.join(import.meta.dirname, './fixtures/mutation-snapshot.json');

const expected = async () => {
  try {
    return await fs.readFile(snapshotPath(), { encoding: 'utf-8' });
  } catch (e) {
    return undefined;
  }
};

test('Mutation report matches snapshot of good report', async () => {
  const shouldUpdateSnapshot = process.env['UPDATE_SNAPSHOT'];
  const actualMutationReport = await actual();
  const snapshotReport = await expected();

  if (!snapshotReport) {
    console.log('Writing actual as snapshot into fixtures.');
    await fs.writeFile(snapshotPath(), actualMutationReport, { encoding: 'utf-8' });
    return;
  }

  if (actualMutationReport !== snapshotReport) {
    if (shouldUpdateSnapshot) {
      console.log('Writing actual as snapshot into fixtures.');
      await fs.writeFile(snapshotPath(), actualMutationReport, { encoding: 'utf-8' });
      return;
    }

    throw new Error('Actual was not equal to snapshot.');
  }
});
