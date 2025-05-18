const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/design/tokens.css');
const tsPath = path.join(__dirname, '../src/design/design-tokens.ts');

const css = fs.readFileSync(cssPath, 'utf8');

const tokenRegex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
const tokens = [];
let match;
while ((match = tokenRegex.exec(css))) {
  tokens.push({ name: match[1], value: match[2].trim() });
}

const lines = [];
lines.push('/**');
lines.push(' * Auto-generated from tokens.css');
lines.push(' * Run `pnpm generate:tokens` to regenerate.');
lines.push(' */');
lines.push('');
lines.push('export const designTokens = {');
for (const t of tokens) {
  const value = t.value.replace(/"/g, '\\"');
  lines.push(`  ${t.name}: "${value}",`);
}
lines.push('} as const;');
lines.push('');
lines.push('export type DesignTokens = typeof designTokens;');
lines.push('export type DesignTokenName = keyof DesignTokens;');
lines.push('');

fs.writeFileSync(tsPath, lines.join('\n'));
console.log(`Generated ${path.relative(process.cwd(), tsPath)} with ${tokens.length} tokens.`);
