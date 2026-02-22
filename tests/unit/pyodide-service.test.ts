import {describe, expect, test} from 'vitest';
import {collectDirectoryPaths} from '../../src/services/pyodideService';

describe('collectDirectoryPaths', () => {
  test('returns nested directories in creation order', () => {
    const directories = collectDirectoryPaths([
      'main.robot',
      'resources/auth.resource',
      'resources/orders/create.resource',
    ]);

    expect(directories).toEqual([
      '/workspace/resources',
      '/workspace/resources/orders',
    ]);
  });
});
