import {createStore, del, get, set} from 'idb-keyval';
import type {ExampleChapterState} from '@site/src/types/examples';

const CACHE_DB = 'robot-framework-book';
const CACHE_STORE = 'chapter-state';
const store = createStore(CACHE_DB, CACHE_STORE);

export const PERSISTENCE_ENABLED = true;

function chapterKey(chapterId: string): string {
  return `chapter:${chapterId}`;
}

export async function saveChapterState(
  chapterId: string,
  state: ExampleChapterState,
): Promise<void> {
  if (!PERSISTENCE_ENABLED) {
    return;
  }
  await set(chapterKey(chapterId), state, store);
}

export async function loadChapterState(
  chapterId: string,
): Promise<ExampleChapterState | undefined> {
  if (!PERSISTENCE_ENABLED) {
    return undefined;
  }
  const value = await get<ExampleChapterState>(chapterKey(chapterId), store);
  return value;
}

export async function clearChapterState(chapterId: string): Promise<void> {
  await del(chapterKey(chapterId), store);
}
