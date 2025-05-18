module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/contracts',
            from: './src',
            except: ['./src/contracts'],
          },
          {
            target: './src/data',
            from: './src/state',
          },
          {
            target: './src/data',
            from: './src/ui',
          },
          {
            target: './src/data',
            from: './src/logic/processing',
          },
          {
            target: './src/logic/workers',
            from: './src/state',
          },
          {
            target: './src/logic/workers',
            from: './src/ui',
          },
          {
            target: './src/logic/processing',
            from: './src/ui',
          },
          {
            target: './src/logic/processing',
            from: './src/logic/workers',
            except: ['./src/logic/workers/utils'],
          },
          {
            target: './src/state',
            from: './src/ui',
          },
          {
            target: './src/hooks',
            from: './src/data',
          },
          {
            target: './src/hooks',
            from: './src/logic/workers',
          },
          {
            target: './src/ui',
            from: './src/data',
          },
          {
            target: './src/ui',
            from: './src/logic/workers',
          },
          {
            target: './src/ui',
            from: './src/logic/processing',
          },
          {
            target: './src/services',
            from: './src/ui',
          },
          {
            target: './src/services',
            from: './src/state',
            except: ['./src/services/eventListeners.ts'],
          },
        ],
      },
    ],
  },
};
