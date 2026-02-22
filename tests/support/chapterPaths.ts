export const chapterDocPaths = [
  '/docs/01-introduction',
  '/docs/02-installation-concepts',
  '/docs/03-robot-framework-basics',
  '/docs/04-multi-file-architecture',
  '/docs/05-advanced-keywords',
  '/docs/06-python-integration',
  '/docs/07-best-practices',
  '/docs/08-enterprise-patterns',
  '/docs/09-real-world-case-study',
  '/docs/10-final-capstone-project',
] as const;

export const primarySitePaths = [
  '/',
  '/docs/book-overview',
  ...chapterDocPaths,
  '/docs/authoritative-resources',
  '/docs/tooling/github-cli-and-mcp',
] as const;
