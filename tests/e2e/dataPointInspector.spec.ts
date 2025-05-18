import { test, expect } from './fixtures';
import path from 'path';

const fixturePath = path.resolve(__dirname, '../fixtures/basic-snapshot.json');

test('DataPointInspector drawer zones visible', async ({ page }) => {
  await page.goto('/');

  await page.setInputFiles('input[type="file"]', fixturePath);

  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();

  await expect(drawer.getByRole('heading')).toBeVisible();
  await expect(drawer.getByText(/series/i)).toBeVisible();
  await expect(drawer.getByText('ATTRIBUTES')).toBeVisible();
  await expect(drawer.getByText('EXEMPLARS')).toBeVisible();
  await expect(drawer.getByText('RAW DATA')).toBeVisible();
});
