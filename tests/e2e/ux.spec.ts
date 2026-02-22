import {expect, test} from '@playwright/test';
import {sitePath} from '../support/sitePaths';

test('playground controls are visible and clickable', async ({page}) => {
  await page.goto(sitePath('/docs/03-robot-framework-basics'));

  await expect(page.getByTestId('file-explorer')).toBeVisible();
  await expect(page.getByTestId('run-button')).toBeVisible();
  await expect(page.getByTestId('reset-button')).toBeVisible();

  await page.getByTestId('run-button').click();
  await expect(page.locator('text=Execution Output')).toBeVisible();
});

test('dark and light theme toggle works', async ({page}) => {
  await page.goto(sitePath('/docs/01-introduction'));

  const themeToggle = page.locator('button[aria-label*="Switch between dark and light mode"]');
  const getTheme = async () => page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const initialTheme = await getTheme();

  await themeToggle.click();
  await expect.poll(getTheme).not.toBe(initialTheme);

  const toggledTheme = await getTheme();
  await themeToggle.click();
  await expect.poll(getTheme).not.toBe(toggledTheme);
  await expect.poll(getTheme).toBe(initialTheme);
});

test('mobile viewport remains usable', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto(sitePath('/docs/05-advanced-keywords'));

  await expect(page.getByTestId('run-button')).toBeVisible();
  await expect(page.getByTestId('file-explorer')).toBeVisible();
});
