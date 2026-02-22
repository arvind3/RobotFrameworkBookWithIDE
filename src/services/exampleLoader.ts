import {z} from 'zod';
import type {ExampleFileContentMap, ExampleManifest} from '@site/src/types/examples';

const EXAMPLE_FILE_SCHEMA = z.object({
  path: z.string().min(1),
  language: z.enum(['robot', 'python', 'text', 'yaml', 'json']),
  editable: z.boolean(),
  entry: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const EXAMPLE_MANIFEST_SCHEMA = z.object({
  chapterId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  entrypoint: z.string().min(1),
  files: z.array(EXAMPLE_FILE_SCHEMA).min(1),
  dependencies: z.array(z.string().min(1)).optional(),
});

function ensureTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }
  return response.json();
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }
  return response.text();
}

export async function loadManifest(
  chapterId: string,
  examplesBasePath = '/examples',
): Promise<ExampleManifest> {
  const base = ensureTrailingSlash(examplesBasePath);
  const manifestUrl = `${base}${chapterId}/manifest.json`;
  const payload = await fetchJson(manifestUrl);
  return EXAMPLE_MANIFEST_SCHEMA.parse(payload);
}

export async function loadFiles(
  chapterId: string,
  manifest: ExampleManifest,
  examplesBasePath = '/examples',
): Promise<ExampleFileContentMap> {
  const base = ensureTrailingSlash(examplesBasePath);
  const chapterBase = `${base}${chapterId}/`;
  const files = await Promise.all(
    manifest.files.map(async (file) => {
      const content = await fetchText(`${chapterBase}${file.path}`);
      return [file.path, content] as const;
    }),
  );

  return Object.fromEntries(files);
}
