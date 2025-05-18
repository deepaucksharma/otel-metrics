export default [
  {
    files: ["**/*.{js,jsx,ts,tsx,md}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      semi: ["error", "always"],
    },
  },
];
