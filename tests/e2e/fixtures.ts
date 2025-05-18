import { test as base, expect } from '@playwright/test';
import fs from 'fs';

export const test = base.extend<{ page: import('@playwright/test').Page }>({
  page: async ({ page }, use, testInfo) => {
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });
    await use(page);
    if (logs.length) {
      const file = testInfo.outputPath('console.log');
      await fs.promises.mkdir(testInfo.outputDir, { recursive: true });
      await fs.promises.writeFile(file, logs.join('\n'), 'utf8');
      await testInfo.attach('console', { path: file, contentType: 'text/plain' });
    }
  },
});

export { expect };
