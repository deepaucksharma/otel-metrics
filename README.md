# IntelliMetric Explorer — Nano-Module OTLP Inspector

This repo hosts **IntelliMetric Explorer**, a browser work-bench for
microscopically analysing a single OTLP snapshot.

* **Specs live next to code** (`src/**.md`) and are PR-reviewed.
* **Nano-module architecture** → every file ≈ 50-150 LoC, single
  responsibility.
* **Inspector 1.1** is the current MVP target.

## Quick start

```bash
pnpm i          # install deps
pnpm dev        # Vite + HMR
pnpm test:unit  # Jest/Vitest
pnpm lint
```

After installing dependencies the project can be verified locally:

```bash
pnpm lint  # runs ESLint using eslint.config.js
pnpm dev   # starts the Vite dev server
```

Ensure `eslint.config.js` and `tsconfig.json` exist in the repository root
before running these commands.

## Documentation

The Markdown specs inside `src/` are automatically published to
https://deepaucksharma.github.io/otel-metrics/ every push to `main`.
