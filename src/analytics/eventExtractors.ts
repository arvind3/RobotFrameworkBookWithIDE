export type ChapterMeta = {
  chapterId: string;
  chapterTitle: string;
  contentGroup: string;
};

function cleanTitle(title: string): string {
  const withoutSiteSuffix = title.replace(/\s*\|\s*Robot Framework IDE Book\s*$/i, '').trim();
  return withoutSiteSuffix || 'Untitled Chapter';
}

export function inferContentGroup(pathname: string): string {
  if (pathname.includes('/docs/tooling')) {
    return 'tooling';
  }
  if (pathname.includes('/docs/')) {
    return 'chapter';
  }
  return 'site';
}

export function inferChapterId(pathname: string): string {
  const docsSplit = pathname.split('/docs/');
  const docsPath = docsSplit[1] || '';
  const normalized = docsPath.replace(/\/+$/, '').trim();
  if (!normalized) {
    return 'book-overview';
  }
  const parts = normalized.split('/').filter(Boolean);
  const leaf = parts[parts.length - 1] || 'book-overview';
  return leaf.toLowerCase();
}

export function getChapterMeta(pathname: string, title: string): ChapterMeta {
  return {
    chapterId: inferChapterId(pathname),
    chapterTitle: cleanTitle(title),
    contentGroup: inferContentGroup(pathname),
  };
}

export function isDocsPath(pathname: string): boolean {
  return pathname.includes('/docs/');
}
