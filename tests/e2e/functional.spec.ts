import {expect, test} from '@playwright/test';
import {isInternalSitePath, sitePath} from '../support/sitePaths';

const routes = [
  sitePath('/'),
  sitePath('/docs/01-introduction'),
  sitePath('/docs/02-installation-concepts'),
  sitePath('/docs/03-robot-framework-basics'),
  sitePath('/docs/04-multi-file-architecture'),
  sitePath('/docs/05-advanced-keywords'),
  sitePath('/docs/06-python-integration'),
  sitePath('/docs/07-best-practices'),
  sitePath('/docs/08-enterprise-patterns'),
  sitePath('/docs/09-real-world-case-study'),
  sitePath('/docs/10-final-capstone-project'),
  sitePath('/docs/tooling/github-cli-and-mcp'),
];

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
