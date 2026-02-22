import {expect, test} from '@playwright/test';
import {sitePath} from '../support/sitePaths';

test('chapter example executes and returns output', async ({page}) => {
  await page.goto(sitePath('/docs/01-introduction'));
  await page.locator('[data-testid="robot-playground"]').waitFor();

  await page.getByTestId('run-button').click();
  await expect(page.locator('text=Execution Output')).toBeVisible();
  await expect(page.locator('span', {hasText: 'PASS'})).toBeVisible({timeout: 120_000});
});

test('multi-file explorer and re-run flow works', async ({page}) => {
  await page.goto(sitePath('/docs/04-multi-file-architecture'));
  await page.locator('[data-testid="file-explorer"]').waitFor();

  await expect(page.locator('button', {hasText: 'main.robot'})).toBeVisible();
  await expect(page.locator('button', {hasText: 'auth.resource'})).toBeVisible();

  await page.getByTestId('run-button').click();
  await expect(page.locator('span', {hasText: 'PASS'})).toBeVisible({timeout: 120_000});

  await page.getByTestId('reset-button').click();
  await expect(page.locator('pre', {hasText: 'Files reset to chapter defaults.'})).toBeVisible();
});
