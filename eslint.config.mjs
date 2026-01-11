// @ts-check
import vitest from '@vitest/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  eslintConfigPrettier,
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/block-order': [
        'error',
        { order: ['spec', 'script', 'template', 'style'] },
      ],
      'vue/no-empty-component-block': 'error',
    },
  },
  {
    files: ['**/*.test.ts'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/consistent-each-for': [
        'warn',
        { test: 'each', describe: 'each' },
      ],
      'vitest/consistent-test-it': ['warn', { fn: 'test' }],
      'vitest/consistent-vitest-vi': ['warn', { fn: 'vi' }],
      'vitest/hoisted-apis-on-top': 'warn',
      'vitest/no-alias-methods': 'warn',
      'vitest/no-conditional-in-test': 'error',
      'vitest/no-duplicate-hooks': 'error',
      'vitest/no-test-return-statement': 'error',
      'vitest/padding-around-describe-blocks': 'warn',
      'vitest/padding-around-test-blocks': 'warn',
      'vitest/prefer-comparison-matcher': 'warn',
      'vitest/prefer-each': 'warn',
      'vitest/prefer-equality-matcher': 'warn',
      'vitest/prefer-hooks-in-order': 'warn',
      'vitest/prefer-hooks-on-top': 'warn',
      'vitest/prefer-mock-promise-shorthand': 'warn',
      'vitest/prefer-mock-return-shorthand': 'warn',
      'vitest/prefer-strict-equal': 'warn',
      'vitest/require-to-throw-message': 'error',
      'vitest/require-top-level-describe': 'error',
      'vitest/warn-todo': 'warn',
    },
  }
)
