import { test, expect } from '@playwright/test';
import path from 'path';

const fixturePath = path.resolve(__dirname, '../fixtures/basic-snapshot.json');

test('drawer attribute focus, drop simulation and close', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', fixturePath);

  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();

  // focus first attribute
  await drawer.getByText('host').click();
  await expect(drawer.getByText('Simulate drop: host')).toBeVisible();

  // toggle drop simulation
  const checkbox = drawer.getByRole('checkbox');
  await checkbox.check();
  await expect(drawer.getByText(/series/)).toBeVisible();

  // close via ESC
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
});
