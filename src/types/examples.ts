export type ExampleLanguage = 'robot' | 'python' | 'text' | 'yaml' | 'json';

export interface ExampleFile {
  path: string;
  language: ExampleLanguage;
  editable: boolean;
  entry?: boolean;
  order?: number;
}

export interface ExampleManifest {
  chapterId: string;
  title: string;
  description?: string;
  entrypoint: string;
  files: ExampleFile[];
  dependencies?: string[];
}

export type ExampleFileContentMap = Record<string, string>;

export interface ExampleChapterState {
  selectedFile: string;
  files: ExampleFileContentMap;
}
