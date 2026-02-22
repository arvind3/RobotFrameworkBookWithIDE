import {expect, test} from '@playwright/test';
import {primarySitePaths} from '../support/chapterPaths';
import {isInternalSitePath, sitePath} from '../support/sitePaths';

const routes = primarySitePaths.map((path) => sitePath(path));

test('all primary routes load without console errors', async ({page}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.ok(), `Route failed: ${route}`).toBeTruthy();
    await expect(page.locator('main')).toBeVisible();
  }

  expect(consoleErrors).toEqual([]);
});

test('sidebar navigation has no broken chapter links', async ({page, request}) => {
  await page.goto(sitePath('/docs/01-introduction'));

  const links = await page
    .locator(`a.menu__link[href*="${sitePath('/docs/')}"]`)
    .evaluateAll((nodes) =>
      Array.from(new Set(nodes.map((node) => node.getAttribute('href')).filter(Boolean))),
    );

  for (const link of links) {
    if (!isInternalSitePath(String(link))) {
      continue;
    }

    const response = await request.get(String(link));
    expect(response.ok(), `Broken link: ${link}`).toBeTruthy();
  }
});
