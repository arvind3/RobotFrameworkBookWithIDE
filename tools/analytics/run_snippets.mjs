import {spawnSync} from 'node:child_process';

const isWin = process.platform === 'win32';
const pythonBin = isWin ? 'py' : 'python3';
const pythonArgs = isWin ? ['-3'] : [];

const result = spawnSync(
  pythonBin,
  [
    ...pythonArgs,
    'tools/analytics/generate_tag_snippet.py',
    '--config',
    'analytics/analytics.config.json',
    '--mode',
    'both',
    '--output-dir',
    'artifacts/snippets',
  ],
  {stdio: 'inherit'}
);

process.exit(result.status ?? 1);
