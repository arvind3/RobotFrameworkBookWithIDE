import {describe, expect, test} from 'vitest';
import {applyFileEdit, resetToBaseline} from '../../src/services/fileState';

describe('file state helpers', () => {
  test('applyFileEdit updates one file while preserving others', () => {
    const files = {
      'main.robot': 'A',
      'resources/common.resource': 'B',
    };

    const updated = applyFileEdit(files, 'main.robot', 'C');

    expect(updated['main.robot']).toBe('C');
    expect(updated['resources/common.resource']).toBe('B');
  });

  test('resetToBaseline returns a copy', () => {
    const baseline = {
      'main.robot': 'original',
    };

    const reset = resetToBaseline(baseline);
    expect(reset).toEqual(baseline);
    expect(reset).not.toBe(baseline);
  });
});
