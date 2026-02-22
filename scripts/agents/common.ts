import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

export const chapterDocs = [
  'docs/01-introduction.mdx',
  'docs/02-installation-concepts.mdx',
  'docs/03-robot-framework-basics.mdx',
  'docs/04-multi-file-architecture.mdx',
  'docs/05-advanced-keywords.mdx',
  'docs/06-python-integration.mdx',
  'docs/07-best-practices.mdx',
  'docs/08-enterprise-patterns.mdx',
  'docs/09-real-world-case-study.mdx',
  'docs/10-final-capstone-project.mdx',
];

export const requiredSections = [
  '## Concept Explanation',
  '## Example Files',
  '## Editable Execution Block',
  '## Try It Yourself',
  '## Common Mistakes',
  '## Summary',
  '## Next Steps',
];

export async function readProjectFile(relativePath: string): Promise<string> {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  return readFile(absolutePath, 'utf8');
}

export async function writeJsonReport(relativePath: string, payload: unknown): Promise<void> {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  await mkdir(path.dirname(absolutePath), {recursive: true});
  await writeFile(absolutePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}
