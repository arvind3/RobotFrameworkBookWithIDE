import {cp, mkdir, readdir, rm, stat} from 'node:fs/promises';
import path from 'node:path';

export async function ensureCleanDirectory(directory: string): Promise<void> {
  await rm(directory, {recursive: true, force: true});
  await mkdir(directory, {recursive: true});
}

export async function copyDirectory(sourceDir: string, destinationDir: string): Promise<void> {
  await cp(sourceDir, destinationDir, {recursive: true});
}

export async function syncExamples(
  sourceDir = path.resolve(process.cwd(), 'examples'),
  destinationDir = path.resolve(process.cwd(), 'static/examples'),
): Promise<void> {
  await mkdir(sourceDir, {recursive: true});
  await ensureCleanDirectory(destinationDir);

  const sourceEntries = await readdir(sourceDir);
  if (!sourceEntries.length) {
    return;
  }

  await copyDirectory(sourceDir, destinationDir);

  const destinationStat = await stat(destinationDir);
  if (!destinationStat.isDirectory()) {
    throw new Error(`Expected ${destinationDir} to be a directory after copy.`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncExamples()
    .then(() => {
      process.stdout.write('Synced examples -> static/examples\n');
    })
    .catch((error) => {
      process.stderr.write(`Failed to sync examples: ${(error as Error).message}\n`);
      process.exitCode = 1;
    });
}
