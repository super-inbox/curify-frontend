// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import tseslint from 'typescript-eslint'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config({
  files: ['**/*.{ts,tsx,js,jsx}'],
  plugins: {
    'react-hooks': eslintPluginReactHooks,
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  {
    "extends": ["next/core-web-vitals", "next/typescript"]
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: './tsconfig.json',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
}, storybook.configs["flat/recommended"]);
