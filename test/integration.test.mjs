import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import fakeDiff from 'fake-diff';
import { pathToFileURL } from 'node:url';
import dedent from 'dedent';
import process from 'node:process';

const locFormat = ({ location: { start, end } }) =>
  `s l:${start.line},c:${start.column} e l:${end.line},c:${end.column}`;

const sortAndStripMutants = (mutants) =>
  mutants
    .toSorted((a, b) => locFormat(a).localeCompare(locFormat(b)))
    .map((m) => ({
      ...m,
      id: undefined,
      statusReason: m.status === 'Ignored' ? m.statusReason : undefined,
    }));

const sortAndStripFiles = (files) =>
  Object.entries(files)
    .map(([key, value]) => [
      key,
      {
        ...value,
        mutants: sortAndStripMutants(value.mutants),
      },
    ])
    .toSorted(([a], [b]) => a.localeCompare(b));

const actual = async () => {
  const actualPath = path.join(import.meta.dirname, '../reports/mutation/mutation.json');
  let contents;
  try {
    contents = await fs.readFile(actualPath, { encoding: 'utf-8' });
  } catch {
    throw new Error(`Actual Stryker report at '${actualPath}' was missing.`);
  }

  const mutationReport = JSON.parse(contents);
  return JSON.stringify({
    ...mutationReport,
    files: sortAndStripFiles(mutationReport.files),
    projectRoot: undefined,
  });
};

const snapshotPath = () => path.join(import.meta.dirname, './fixtures/mutation-snapshot.json');

const htmlPath = () => path.join(import.meta.dirname, '../reports/mutation/mutation.html');

const expected = async () => {
  try {
    return await fs.readFile(snapshotPath(), { encoding: 'utf-8' });
  } catch {
    return undefined;
  }
};

const updateSnapshot = async (report) => {
  console.log('Writing actual as snapshot into fixtures.');
  await fs.writeFile(snapshotPath(), report, { encoding: 'utf-8' });
};

const format = (report) => JSON.stringify(JSON.parse(report), null, 2);

test('Mutation report has only ignored or killed', async () => {
  const actualMutationReport = await actual();

  const mutations = JSON.parse(actualMutationReport);
  const sumNotIgnored = mutations.files
    .flatMap(([, value]) => value.mutants.map((m) => (m.status === 'Ignored' || m.status === 'Killed' ? 0 : 1)))
    .reduce((a, b) => a + b, 0);

  if (sumNotIgnored !== 0) {
    const file = pathToFileURL(htmlPath());
    throw new Error(`Found at least one non-ignored mutation. See ${file}`);
  }
});

test('Total ignore count matches approved', async () => {
  const expectedIgnoreCount = 11;
  const actualMutationReport = await actual();

  const mutations = JSON.parse(actualMutationReport);
  const sumIgnored = mutations.files
    .flatMap(([, value]) => value.mutants.map((m) => (m.status === 'Ignored' ? 1 : 0)))
    .reduce((a, b) => a + b, 0);

  if (sumIgnored !== expectedIgnoreCount) {
    const file = pathToFileURL(htmlPath());
    throw new Error(dedent`
      Found mismatched number of ignored mutations. See ${file}
      Expected: ${expectedIgnoreCount}, Got: ${sumIgnored}.
      Update the expectedIgnoreCount if the new number is correct.`);
  }
});

test('Mutation report matches snapshot of approved report', async () => {
  const shouldUpdateSnapshot = process.env['UPDATE_SNAPSHOT'];
  const actualMutationReport = await actual();
  const snapshotReport = await expected();

  if (!snapshotReport) {
    await updateSnapshot(actualMutationReport);
  } else if (actualMutationReport !== snapshotReport) {
    if (shouldUpdateSnapshot) {
      await updateSnapshot(actualMutationReport);
    } else {
      const actualFormatted = format(actualMutationReport);
      const snapshotFormatted = format(snapshotReport);

      const diff = fakeDiff(snapshotFormatted, actualFormatted);
      throw new Error(dedent`
			  Actual was not equal to snapshot:
				${diff}`);
    }
  }
});
