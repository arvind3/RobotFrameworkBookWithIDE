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

test('playground controls are visible and clickable', async ({page}) => {
  await page.goto(sitePath('/docs/03-robot-framework-basics'));

  await expect(page.getByTestId('file-explorer')).toBeVisible();
  await expect(page.getByTestId('run-button')).toBeVisible();
  await expect(page.getByTestId('reset-button')).toBeVisible();

  await page.getByTestId('run-button').click();
  await expect(page.locator('text=Execution Output')).toBeVisible();
});

test('dark and light theme toggle control is available', async ({page}) => {
  await page.goto(sitePath('/docs/01-introduction'));

  const themeToggle = page.locator('button[aria-label*="Switch between dark and light mode"]:visible').first();
  await expect(themeToggle).toBeVisible();
  await expect(themeToggle).toBeEnabled();
  await themeToggle.click();
  await expect(themeToggle).toBeVisible();
});

test('homepage hero code panel keeps readable contrast', async ({page}) => {
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

test('mobile viewport remains usable', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto(sitePath('/docs/05-advanced-keywords'));

  await expect(page.getByTestId('run-button')).toBeVisible();
  await expect(page.getByTestId('file-explorer')).toBeVisible();
});
