import type {APIRequestContext} from '@playwright/test';
import {expect, test} from '@playwright/test';
import {sitePath} from '../support/sitePaths';

function parseRgb(color: string): [number, number, number] {
  const match = color.match(/\d+(\.\d+)?/g);
  if (!match || match.length < 3) {
    throw new Error(`Unable to parse color value: ${color}`);
  }
  return [Number(match[0]), Number(match[1]), Number(match[2])];
}

function linearizeChannel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * linearizeChannel(r) + 0.7152 * linearizeChannel(g) + 0.0722 * linearizeChannel(b);
}

function contrastRatio(foreground: [number, number, number], background: [number, number, number]): number {
  const l1 = luminance(foreground);
  const l2 = luminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const primaryRoutes = [
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

async function waitForSiteReadiness(request: APIRequestContext, route: string): Promise<void> {
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= 24; attempt += 1) {
    const response = await request.get(route, {timeout: 20_000});
    lastStatus = response.status();

    if (response.ok()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error(`Live site did not become healthy. Last status for ${route}: ${lastStatus ?? 'n/a'}`);
}

test.beforeAll(async ({request}) => {
  await waitForSiteReadiness(request, sitePath('/'));
});

test('all primary routes respond with HTTP success', async ({request}) => {
  for (const route of primaryRoutes) {
    const response = await request.get(route, {timeout: 30_000});
    expect(response.ok(), `Live route failed: ${route} [${response.status()}]`).toBeTruthy();
  }
});

test('chapter page has no broken internal links', async ({page, request}) => {
  await page.goto(sitePath('/docs/01-introduction'));
  await page.locator('main').waitFor();

  const hrefs = await page
    .locator('a[href]')
    .evaluateAll((nodes) =>
      Array.from(new Set(nodes.map((node) => node.getAttribute('href')).filter(Boolean))),
    );

  const pageUrl = new URL(page.url());
  const targets = new Set<string>();

  for (const href of hrefs) {
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }

    const resolved = new URL(href, pageUrl);
    const targetPath = `${resolved.pathname}${resolved.search}`;

    if (resolved.origin !== pageUrl.origin || !targetPath.startsWith(sitePath('/'))) {
      continue;
    }

    targets.add(targetPath);
  }

  for (const target of targets) {
    const response = await request.get(target, {timeout: 30_000});
    expect(response.ok(), `Broken live link: ${target} [${response.status()}]`).toBeTruthy();
  }
});

test('primary pages render without console and page errors', async ({page}) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  for (const route of [sitePath('/'), sitePath('/docs/01-introduction'), sitePath('/docs/10-final-capstone-project')]) {
    const response = await page.goto(route, {waitUntil: 'networkidle'});
    expect(response?.ok(), `Failed to render: ${route}`).toBeTruthy();
    await expect(page.locator('main')).toBeVisible();
  }

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('homepage hero code panel contrast is readable', async ({page}) => {
  await page.goto(sitePath('/'));

  const metrics = await page.getByTestId('hero-code-snippet').evaluate((el) => {
    const codeStyles = getComputedStyle(el);
    const cardStyles = getComputedStyle(el.parentElement as HTMLElement);
    return {
      codeColor: codeStyles.color,
      cardBackground: cardStyles.backgroundColor,
    };
  });

  const ratio = contrastRatio(parseRgb(metrics.codeColor), parseRgb(metrics.cardBackground));
  expect(ratio).toBeGreaterThan(4.5);
});

test('live playground executes chapter sample', async ({page}) => {
  await page.goto(sitePath('/docs/01-introduction'));
  await page.locator('[data-testid="robot-playground"]').waitFor();

  await page.getByTestId('run-button').click();
  await expect(page.locator('text=Execution Output')).toBeVisible();
  await expect(page.locator('span', {hasText: 'PASS'})).toBeVisible({timeout: 180_000});
});

test('live runner works across chapters in one browser session', async ({page}) => {
  await page.goto(sitePath('/docs/01-introduction'));
  await page.locator('[data-testid="robot-playground"]').waitFor();
  await page.getByTestId('run-button').click();
  await expect(page.locator('span', {hasText: 'PASS'})).toBeVisible({timeout: 180_000});

  await page.goto(sitePath('/docs/10-final-capstone-project'));
  await page.locator('[data-testid="robot-playground"]').waitFor();
  await page.getByTestId('run-button').click();
  await expect(page.locator('span', {hasText: 'PASS'})).toBeVisible({timeout: 180_000});
});
