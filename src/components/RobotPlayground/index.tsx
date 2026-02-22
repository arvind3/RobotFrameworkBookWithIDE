import React, {useEffect, useMemo, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useColorMode} from '@docusaurus/theme-common';
import type {ExampleFileContentMap, ExampleManifest} from '@site/src/types/examples';
import {loadFiles, loadManifest} from '@site/src/services/exampleLoader';
import {applyFileEdit, resetToBaseline} from '@site/src/services/fileState';
import {clearChapterState, loadChapterState, saveChapterState} from '@site/src/services/idbCache';
import {runRobot} from '@site/src/services/pyodideService';
import EditorPane from './EditorPane';
import ErrorBanner from './ErrorBanner';
import FileExplorer from './FileExplorer';
import LoadingState from './LoadingState';
import OutputConsole from './OutputConsole';
import RunResetToolbar from './RunResetToolbar';
import styles from './styles.module.css';

export interface RobotPlaygroundProps {
  chapterId: string;
  initialFile?: string;
  height?: number;
}

type RunStatus = 'idle' | 'running' | 'pass' | 'fail';

function resolveInitialFile(
  manifest: ExampleManifest,
  files: ExampleFileContentMap,
  requestedInitialFile?: string,
): string {
  if (requestedInitialFile && files[requestedInitialFile]) {
    return requestedInitialFile;
  }

  if (files[manifest.entrypoint]) {
    return manifest.entrypoint;
  }

  const entryFile = manifest.files.find((file) => file.entry);
  if (entryFile && files[entryFile.path]) {
    return entryFile.path;
  }

  return manifest.files
    .slice()
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))[0]
    .path;
}

function RobotPlaygroundClient({
  chapterId,
  initialFile,
  height = 420,
}: RobotPlaygroundProps): React.JSX.Element {
  const {colorMode} = useColorMode();
  const examplesBasePath = useBaseUrl('/examples');

  const [manifest, setManifest] = useState<ExampleManifest | null>(null);
  const [baselineFiles, setBaselineFiles] = useState<ExampleFileContentMap>({});
  const [files, setFiles] = useState<ExampleFileContentMap>({});
  const [selectedFile, setSelectedFile] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [output, setOutput] = useState('Ready. Click Run to execute this chapter.');
  const [runStatus, setRunStatus] = useState<RunStatus>('idle');

  const sortedFilePaths = useMemo(
    () =>
      Object.keys(files).sort((left, right) => {
        const leftIndex = manifest?.files.find((file) => file.path === left)?.order ?? Number.MAX_SAFE_INTEGER;
        const rightIndex = manifest?.files.find((file) => file.path === right)?.order ?? Number.MAX_SAFE_INTEGER;
        if (leftIndex !== rightIndex) {
          return leftIndex - rightIndex;
        }
        return left.localeCompare(right);
      }),
    [files, manifest],
  );

  useEffect(() => {
    let active = true;

    async function bootstrap(): Promise<void> {
      setLoading(true);
      setError('');
      setRunStatus('idle');
      setOutput('Loading chapter example files...');

      try {
        const loadedManifest = await loadManifest(chapterId, examplesBasePath);
        const loadedFiles = await loadFiles(chapterId, loadedManifest, examplesBasePath);
        const cachedState = await loadChapterState(chapterId);

        if (!active) {
          return;
        }

        const initialSelection = resolveInitialFile(loadedManifest, loadedFiles, initialFile);
        const resolvedSelectedFile =
          cachedState?.selectedFile && loadedFiles[cachedState.selectedFile]
            ? cachedState.selectedFile
            : initialSelection;
        const resolvedFiles =
          cachedState && Object.keys(cachedState.files).length ? cachedState.files : loadedFiles;

        setManifest(loadedManifest);
        setBaselineFiles(loadedFiles);
        setFiles(resolvedFiles);
        setSelectedFile(resolvedSelectedFile);
        setOutput('Ready. Click Run to execute this chapter.');
      } catch (loadError) {
        if (!active) {
          return;
        }
        const message = loadError instanceof Error ? loadError.message : 'Unknown loader error.';
        setError(message);
        setOutput('');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    bootstrap().catch((runtimeError) => {
      setLoading(false);
      setError(runtimeError instanceof Error ? runtimeError.message : 'Unexpected initialization error.');
    });

    return () => {
      active = false;
    };
  }, [chapterId, examplesBasePath, initialFile]);

  useEffect(() => {
    if (!manifest || !selectedFile || !Object.keys(files).length) {
      return;
    }

    saveChapterState(chapterId, {
      selectedFile,
      files,
    }).catch(() => {
      // Cache failures should never block the learning flow.
    });
  }, [chapterId, files, manifest, selectedFile]);

  const onRun = async (): Promise<void> => {
    if (!manifest) {
      return;
    }

    setRunStatus('running');
    setError('');
    setOutput('Executing Robot Framework suite in Pyodide...');

    try {
      const result = await runRobot({
        files,
        entrypoint: manifest.entrypoint,
        dependencies: manifest.dependencies,
      });

      setRunStatus(result.status);
      setOutput(result.output || `Execution finished with return code ${result.returnCode}.`);
    } catch (runError) {
      setRunStatus('fail');
      setError(runError instanceof Error ? runError.message : 'Unknown execution error.');
      setOutput('Execution failed before Robot Framework could produce output.');
    }
  };

  const onReset = async (): Promise<void> => {
    if (!manifest) {
      return;
    }

    const resetFiles = resetToBaseline(baselineFiles);
    const resetSelection = resolveInitialFile(manifest, resetFiles, initialFile);
    setFiles(resetFiles);
    setSelectedFile(resetSelection);
    setRunStatus('idle');
    setOutput('Files reset to chapter defaults.');

    await clearChapterState(chapterId).catch(() => undefined);
  };

  if (loading) {
    return <LoadingState label="Loading example playground..." />;
  }

  if (error && !manifest) {
    return <ErrorBanner message={error} />;
  }

  const currentContent = files[selectedFile] ?? '';

  return (
    <section className={styles.wrapper} data-testid="robot-playground">
      <div className={styles.headerBlock}>
        <h3>Interactive Chapter Runner</h3>
        <p>
          Edit files, run Robot Framework in-browser, and inspect output without leaving this page.
        </p>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <div className={styles.layout}>
        <FileExplorer files={sortedFilePaths} selectedFile={selectedFile} onSelect={setSelectedFile} />

        <div className={styles.workspace}>
          <RunResetToolbar running={runStatus === 'running'} onRun={() => void onRun()} onReset={() => void onReset()} />
          <EditorPane
            path={selectedFile}
            value={currentContent}
            theme={colorMode === 'dark' ? 'dark' : 'light'}
            height={height}
            onChange={(nextValue) => {
              if (!selectedFile) {
                return;
              }
              setFiles((previousFiles) => applyFileEdit(previousFiles, selectedFile, nextValue));
            }}
          />
          <OutputConsole output={output} status={runStatus} />
        </div>
      </div>
    </section>
  );
}

export default function RobotPlayground(props: RobotPlaygroundProps): React.JSX.Element {
  return (
    <BrowserOnly fallback={<LoadingState label="Preparing browser runtime..." />}>
      {() => <RobotPlaygroundClient {...props} />}
    </BrowserOnly>
  );
}
