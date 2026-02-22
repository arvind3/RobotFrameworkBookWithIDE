const rawBasePath = process.env.SITE_BASE_PATH ?? '/RobotFrameworkBookWithIDE';
const trimmedBasePath = rawBasePath === '/' ? '' : rawBasePath.replace(/\/+$/, '');

export function sitePath(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBasePath}${normalized}` || '/';
}

export function isInternalSitePath(path: string): boolean {
  return path.startsWith(sitePath('/'));
}
