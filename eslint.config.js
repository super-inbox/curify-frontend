import tseslint from 'typescript-eslint'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      'react-hooks': eslintPluginReactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
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
  }
)
