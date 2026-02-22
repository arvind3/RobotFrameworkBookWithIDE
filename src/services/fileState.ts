import type {ExampleFileContentMap} from '@site/src/types/examples';

export function cloneFileMap(files: ExampleFileContentMap): ExampleFileContentMap {
  return {...files};
}

export function applyFileEdit(
  files: ExampleFileContentMap,
  path: string,
  content: string,
): ExampleFileContentMap {
  return {
    ...files,
    [path]: content,
  };
}

export function resetToBaseline(
  baseline: ExampleFileContentMap,
): ExampleFileContentMap {
  return cloneFileMap(baseline);
}
