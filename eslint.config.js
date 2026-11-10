import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'backend/node_modules']),
  {
    files: ['src/**/*.{js,jsx}', 'vite.config.js'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // The backend is CommonJS running on Node, not browser/React code.
    files: ['backend/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      // Express error handlers must declare `next` even when unused.
      'no-unused-vars': ['error', { argsIgnorePattern: '^(next|_)', caughtErrors: 'none' }],
    },
  },
])
