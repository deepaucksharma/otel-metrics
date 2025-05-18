import { test, expect } from '@playwright/test';
import path from 'path';

const fixturePath = path.resolve(__dirname, '../fixtures/basic-snapshot.json');

test('raw json expand/collapse and copy', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', fixturePath);

  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();

  const expandBtn = drawer.getByRole('button', { name: 'Expand raw data' });
  await expandBtn.click();
  await expect(drawer.getByRole('button', { name: /Collapse raw data/ })).toBeVisible();

  await page.evaluate(() => {
    window.__copied = '';
    navigator.clipboard.writeText = (text: string) => {
      (window as any).__copied = text;
      return Promise.resolve();
    };
  });

  await drawer.getByRole('button', { name: 'Copy JSON' }).click();
  const copied = await page.evaluate(() => (window as any).__copied);
  expect(copied).toContain('"metricName"');

  await drawer.getByRole('button', { name: 'Collapse raw data' }).click();
  await expect(drawer.getByRole('button', { name: 'Expand raw data' })).toBeVisible();
});
