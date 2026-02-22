import type {ExampleFileContentMap} from '@site/src/types/examples';

const PYODIDE_SCRIPT_URL =
  'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js';
const WORKSPACE_ROOT = '/workspace';
const DEFAULT_DEPENDENCIES = ['robotframework'];

type PyodideLike = {
  FS: {
    mkdir(path: string): void;
    writeFile(path: string, content: string): void;
    readdir(path: string): string[];
    rmdir(path: string): void;
    unlink(path: string): void;
    stat(path: string): {mode: number};
    analyzePath(path: string): {exists: boolean};
    isDir(mode: number): boolean;
  };
  globals: {
    set(name: string, value: unknown): void;
    delete(name: string): void;
  };
  loadPackage(packages: string | string[]): Promise<void>;
  runPythonAsync(code: string): Promise<unknown>;
};

declare global {
  interface Window {
    loadPyodide?: (input: {indexURL: string}) => Promise<PyodideLike>;
  }
}

export interface RunRobotResult {
  output: string;
  status: 'pass' | 'fail';
  returnCode: number;
}

export interface RunRobotRequest {
  files: ExampleFileContentMap;
  entrypoint: string;
  dependencies?: string[];
}

let pyodidePromise: Promise<PyodideLike> | null = null;
const installedPackages = new Set<string>();

function normalizePath(path: string): string {
  return path.replace(/^\/+/, '').replace(/\\/g, '/');
}

export function collectDirectoryPaths(paths: string[]): string[] {
  const directories = new Set<string>();

  for (const filePath of paths) {
    const normalized = normalizePath(filePath);
    const parts = normalized.split('/').filter(Boolean);
    parts.pop();

    let current = WORKSPACE_ROOT;
    for (const part of parts) {
      current = `${current}/${part}`;
      directories.add(current);
    }
  }

  return Array.from(directories).sort((a, b) => a.length - b.length);
}

function ensurePyodideScript(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Pyodide can only be initialized in the browser.');
  }

  if (window.loadPyodide) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PYODIDE_SCRIPT_URL}"]`,
    );

    if (existing) {
      existing.addEventListener('load', () => resolve(), {once: true});
      existing.addEventListener('error', () => reject(new Error('Failed to load Pyodide script.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = PYODIDE_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide script.'));
    document.head.appendChild(script);
  });
}

function ensureWorkspace(fs: PyodideLike['FS']): void {
  if (!fs.analyzePath(WORKSPACE_ROOT).exists) {
    fs.mkdir(WORKSPACE_ROOT);
  }
}

function removeDirectoryRecursive(fs: PyodideLike['FS'], directory: string): void {
  if (!fs.analyzePath(directory).exists) {
    return;
  }

  const children = fs.readdir(directory).filter((entry) => entry !== '.' && entry !== '..');

  for (const child of children) {
    const fullPath = `${directory}/${child}`;
    const stat = fs.stat(fullPath);
    if (fs.isDir(stat.mode)) {
      removeDirectoryRecursive(fs, fullPath);
    } else {
      fs.unlink(fullPath);
    }
  }

  fs.rmdir(directory);
}

function clearDirectoryContents(fs: PyodideLike['FS'], directory: string): void {
  if (!fs.analyzePath(directory).exists) {
    return;
  }

  const children = fs.readdir(directory).filter((entry) => entry !== '.' && entry !== '..');
  for (const child of children) {
    const fullPath = `${directory}/${child}`;
    const stat = fs.stat(fullPath);
    if (fs.isDir(stat.mode)) {
      removeDirectoryRecursive(fs, fullPath);
    } else {
      fs.unlink(fullPath);
    }
  }
}

function writeFilesToWorkspace(fs: PyodideLike['FS'], files: ExampleFileContentMap): void {
  ensureWorkspace(fs);
  const directories = collectDirectoryPaths(Object.keys(files));
  for (const directory of directories) {
    if (!fs.analyzePath(directory).exists) {
      fs.mkdir(directory);
    }
  }

  for (const [relativePath, content] of Object.entries(files)) {
    const targetPath = `${WORKSPACE_ROOT}/${normalizePath(relativePath)}`;
    fs.writeFile(targetPath, content);
  }
}

export async function initPyodide(): Promise<PyodideLike> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      await ensurePyodideScript();
      if (!window.loadPyodide) {
        throw new Error('loadPyodide is unavailable after loading script.');
      }
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/',
      });
      ensureWorkspace(pyodide.FS);
      return pyodide;
    })();
  }

  return pyodidePromise;
}

export async function installPackages(dependencies: string[] = []): Promise<void> {
  const pyodide = await initPyodide();
  const required = Array.from(new Set([...DEFAULT_DEPENDENCIES, ...dependencies])).filter(
    (dependency) => !installedPackages.has(dependency),
  );

  if (!required.length) {
    return;
  }

  await pyodide.loadPackage(['micropip']);
  pyodide.globals.set('PACKAGES_TO_INSTALL', required);

  try {
    await pyodide.runPythonAsync(`
import micropip

for package in PACKAGES_TO_INSTALL.to_py():
    await micropip.install(package)
`);
  } finally {
    pyodide.globals.delete('PACKAGES_TO_INSTALL');
  }

  for (const dependency of required) {
    installedPackages.add(dependency);
  }
}

export async function resetFs(files?: ExampleFileContentMap): Promise<void> {
  const pyodide = await initPyodide();
  const fs = pyodide.FS;

  ensureWorkspace(fs);
  clearDirectoryContents(fs, WORKSPACE_ROOT);

  if (files) {
    writeFilesToWorkspace(fs, files);
  }
}

export async function runRobot(
  request: RunRobotRequest,
): Promise<RunRobotResult> {
  const {files, entrypoint, dependencies = []} = request;
  const pyodide = await initPyodide();

  await installPackages(dependencies);
  await resetFs(files);

  const target = `${WORKSPACE_ROOT}/${normalizePath(entrypoint)}`;
  pyodide.globals.set('ENTRYPOINT_FILE', target);

  try {
    const resultText = await pyodide.runPythonAsync(`
import io
import json
import os
import traceback
from robot import run as robot_run

stream = io.StringIO()
return_code = 1
status = "fail"

try:
    os.chdir("/workspace")
    return_code = int(
        robot_run(
            ENTRYPOINT_FILE,
            log=None,
            report=None,
            output=None,
            stdout=stream,
            stderr=stream,
            console="NONE",
        )
    )
    status = "pass" if return_code == 0 else "fail"
except Exception:
    status = "fail"
    stream.write(traceback.format_exc())
finally:
    os.chdir("/")

json.dumps(
    {
        "status": status,
        "returnCode": return_code,
        "output": stream.getvalue(),
    }
)
`);

    return JSON.parse(String(resultText)) as RunRobotResult;
  } finally {
    pyodide.globals.delete('ENTRYPOINT_FILE');
  }
}
