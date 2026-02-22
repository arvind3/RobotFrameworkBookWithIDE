import {describe, expect, test} from 'vitest';
import {EXAMPLE_MANIFEST_SCHEMA} from '../../src/services/exampleLoader';

describe('example manifest schema', () => {
  test('accepts a valid manifest payload', () => {
    const payload = {
      chapterId: 'chapter-01',
      title: 'Chapter 01',
      entrypoint: 'main.robot',
      files: [{path: 'main.robot', language: 'robot', editable: true}],
      dependencies: ['robotframework'],
    };

    const manifest = EXAMPLE_MANIFEST_SCHEMA.parse(payload);
    expect(manifest.chapterId).toBe('chapter-01');
  });

  test('rejects invalid payloads', () => {
    const payload = {
      chapterId: 'chapter-01',
      title: 'Chapter 01',
      files: [],
    };

    const parsed = EXAMPLE_MANIFEST_SCHEMA.safeParse(payload);
    expect(parsed.success).toBe(false);
  });
});
