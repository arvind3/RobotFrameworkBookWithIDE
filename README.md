# Robot Framework Book With IDE

Interactive Docusaurus book with an in-browser Robot Framework execution environment powered by Pyodide and Monaco Editor.

## Highlights

- 10 chapter learning path from basics to capstone.
- Multi-file chapter examples under `examples/`.
- Browser-native Robot Framework execution with editable files.
- GitHub CLI and GitHub MCP automation scripts.
- Unit tests + Playwright end-to-end coverage.
- CI quality gates and GitHub Pages deployment workflows.

## Requirements

- Node.js 22 (see `.nvmrc`)
- npm
- GitHub CLI authentication (`gh auth status`)

## Quick Start

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use
npm install
npm run sync:examples
npm run dev
```

Open: `http://127.0.0.1:3000/RobotFrameworkBookWithIDE/`

## Key Scripts

- `npm run dev`: start local development server.
- `npm run build`: sync examples + production build.
- `npm run test`: run unit tests.
- `npm run test:e2e`: run Playwright tests.
- `npm run test:e2e:live`: run Playwright against deployed GitHub Pages URL (`LIVE_BASE_URL`).
- `npm run agents:run`: run research/writer/reviewer/editor pipelines in parallel.
- `npm run gh:status`: verify GitHub CLI auth.
- `npm run mcp:github`: launch GitHub MCP server using `gh auth token`.

## Analytics (GA4 + GTM)

- Config file: `analytics/analytics.config.json`
- Contract docs: `analytics/README.md`
- KPI definitions: `analytics/dashboard-kpis.md`

Commands:

- `npm run analytics:validate`: validate analytics contract; if `build/` exists it also scans built HTML for duplicate tag injection.
- `npm run analytics:snippets`: generate GTM/gtag snippets into `artifacts/snippets`.
- `LIVE_BASE_URL=https://arvind3.github.io/RobotFrameworkBookWithIDE npm run analytics:audit:live`: run Playwright analytics runtime audit against live pages.

## Project Layout

- `docs/`: book chapters and tooling docs.
- `examples/`: source example bundles per chapter.
- `static/examples/`: generated runtime example assets (from sync script).
- `src/components/RobotPlayground/`: interactive IDE UI.
- `src/services/`: loader, filesystem/runtime, cache utilities.
- `tests/`: unit and Playwright tests.
- `scripts/`: sync/tooling/agent scripts.
- `.github/workflows/`: CI, agent pipeline, Pages deployment.
