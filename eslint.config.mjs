// @ts-check
import vitest from '@vitest/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier'
import oxlint from 'eslint-plugin-oxlint'
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
        { order: ['spec', 'script', 'template', 'i18n', 'style'] },
      ],
      'vue/no-empty-component-block': 'error',
    },
  },
  {
    files: ['**/*.test.ts'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/padding-around-describe-blocks': 'warn',
      'vitest/padding-around-test-blocks': 'warn',
      'vitest/prefer-mock-promise-shorthand': 'warn',
    },
  }
).prepend(oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'))
