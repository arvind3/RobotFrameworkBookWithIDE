import {spawnSync} from 'node:child_process';

const base = process.env.LIVE_BASE_URL;
if (!base) {
  console.error('LIVE_BASE_URL is required, e.g. https://arvind3.github.io/RobotFrameworkBookWithIDE');
  process.exit(1);
}

const url = `${base.replace(/\/$/, '')}/docs/01-introduction`;

const result = spawnSync(
  'npx',
  [
    'tsx',
    'tools/analytics/audit_events_playwright.ts',
    '--url',
    url,
    '--output',
    'artifacts/ga4-runtime-live.json',
  ],
  {stdio: 'inherit', shell: process.platform === 'win32'}
);

process.exit(result.status ?? 1);
