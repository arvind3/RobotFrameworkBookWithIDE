import {mkdtemp, mkdir, readFile, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, test} from 'vitest';
import {syncExamples} from '../../scripts/sync-examples';

describe('syncExamples', () => {
  test('copies nested files from examples to static/examples', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'rfbook-sync-'));
    const source = path.join(tempRoot, 'examples');
    const destination = path.join(tempRoot, 'static/examples');

    await mkdir(path.join(source, 'chapter-a/resources'), {recursive: true});
    await writeFile(path.join(source, 'chapter-a/manifest.json'), '{"chapterId":"chapter-a"}', 'utf8');
    await writeFile(path.join(source, 'chapter-a/resources/common.resource'), '*** Keywords ***', 'utf8');

    await syncExamples(source, destination);

    const copied = await readFile(path.join(destination, 'chapter-a/resources/common.resource'), 'utf8');
    expect(copied).toContain('*** Keywords ***');
  });
});
