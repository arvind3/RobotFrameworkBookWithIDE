export type AnalyticsPayload = {
  chapter_id?: string;
  chapter_title?: string;
  content_group?: string;
  engagement_bucket?: string;
  page_path?: string;
  [key: string]: unknown;
};

type BookAnalyticsContext = {
  book_id: string;
  version: string;
};

declare global {
  interface Window {
    dataLayer: unknown[];
    bookAnalyticsContext?: BookAnalyticsContext;
    bookAnalyticsTrack?: (eventName: string, params?: Record<string, unknown>) => void;
  }
}

const DEFAULT_CONTEXT: BookAnalyticsContext = {
  book_id: 'robot-framework-book-with-ide',
  version: 'v2',
};

function getContext(): BookAnalyticsContext {
  if (typeof window === 'undefined') {
    return DEFAULT_CONTEXT;
  }
  return window.bookAnalyticsContext || DEFAULT_CONTEXT;
}

function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

export function bookAnalyticsTrack(eventName: string, params: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') {
    return;
  }

  const context = getContext();
  const payload: Record<string, unknown> = {
    event: eventName,
    event_name: eventName,
    book_id: context.book_id,
    page_path: window.location.pathname,
    version: context.version,
    ...params,
  };

  if (typeof window.bookAnalyticsTrack === 'function') {
    window.bookAnalyticsTrack(eventName, payload);
    return;
  }

  pushDataLayer(payload);
}

export function markOnce(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const storageKey = `ga4:v2:${key}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) {
      return false;
    }
    window.sessionStorage.setItem(storageKey, '1');
    return true;
  } catch {
    const fallbackKey = `__${storageKey}`;
    const globalWindow = window as unknown as Record<string, unknown>;
    if (globalWindow[fallbackKey]) {
      return false;
    }
    globalWindow[fallbackKey] = true;
    return true;
  }
}
