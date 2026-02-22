import {expect, test} from '@playwright/test';
import {sitePath} from '../support/sitePaths';

test('initial home load stays under 5 seconds', async ({page}) => {
  await page.goto(sitePath('/'));

  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      loadMs: nav.loadEventEnd - nav.startTime,
    };
  });

  expect(timing.loadMs).toBeLessThan(5000);
});

test('chapter navigation stays under 3 seconds', async ({page}) => {
  await page.goto(sitePath('/docs/01-introduction'));

  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoadedMs: nav.domContentLoadedEventEnd - nav.startTime,
    };
  });

  expect(timing.domContentLoadedMs).toBeLessThan(3000);
});
