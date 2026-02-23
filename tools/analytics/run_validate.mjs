import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const isWin = process.platform === 'win32';
const pythonBin = isWin ? 'py' : 'python3';
const pythonArgs = isWin ? ['-3'] : [];

function run(args) {
  const result = spawnSync(pythonBin, [...pythonArgs, ...args], {stdio: 'inherit'});
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run([
  'tools/analytics/validate_config.py',
  '--config',
  'analytics/analytics.config.json',
  '--output',
  'artifacts/ga4-contract-report.json',
]);

if (existsSync('build')) {
  run([
    'tools/analytics/validate_config.py',
    '--config',
    'analytics/analytics.config.json',
    '--site-dir',
    'build',
    '--output',
    'artifacts/ga4-contract-report-build.json',
  ]);
}
