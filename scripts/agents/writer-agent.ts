import {access} from 'node:fs/promises';
import {chapterDocs, writeJsonReport} from './common';

const expectedManifests = [
  'examples/chapter-01-introduction/manifest.json',
  'examples/chapter-02-installation-concepts/manifest.json',
  'examples/chapter-03-robot-framework-basics/manifest.json',
  'examples/chapter-04-multi-file-architecture/manifest.json',
  'examples/chapter-05-advanced-keywords/manifest.json',
  'examples/chapter-06-python-integration/manifest.json',
  'examples/chapter-07-best-practices/manifest.json',
  'examples/chapter-08-enterprise-patterns/manifest.json',
  'examples/chapter-09-real-world-case-study/manifest.json',
  'examples/chapter-10-final-capstone-project/manifest.json',
];

async function main(): Promise<void> {
  const missing: string[] = [];

  for (const file of [...chapterDocs, ...expectedManifests]) {
    try {
      await access(file);
    } catch {
      missing.push(file);
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    checkedItems: chapterDocs.length + expectedManifests.length,
    missing,
    ready: missing.length === 0,
  };

  await writeJsonReport('reports/writer.json', report);

  if (missing.length > 0) {
    console.error('Writer agent failed. Missing files:', missing.join(', '));
    process.exitCode = 1;
  } else {
    console.log('Writer agent completed: chapter docs and manifests present.');
  }
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
