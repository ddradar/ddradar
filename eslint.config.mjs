// @ts-check
import eslint from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier'
import node from 'eslint-plugin-n'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import typescript from 'typescript-eslint'

import withNuxt from './web/.nuxt/eslint.config.mjs'

export default withNuxt()
  .prepend(
    eslint.configs.recommended,
    // @ts-expect-error - type
    ...typescript.config(...typescript.configs.recommended),
    {
      plugins: { 'simple-import-sort': simpleImportSort },
      rules: {
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
      },
    },
    {
      ...node.configs['flat/recommended'],
      settings: {
        n: {
          allowModules: ['@eslint/js', 'defu', 'h3', 'ufo', 'vue-i18n'],
        },
      },
    },
    {
      files: ['**/*.ts', '**/*.vue'],
      rules: { 'n/no-missing-import': 'off' },
    },
    {
      files: ['**/*.test.ts'],
      plugins: { vitest },
      rules: {
        ...vitest.configs.recommended.rules,
        'vitest/consistent-test-filename': 'error',
        'vitest/consistent-test-it': ['error', { fn: 'test' }],
        'vitest/no-alias-methods': 'error',
        'vitest/no-conditional-in-test': 'error',
        'vitest/no-disabled-tests': 'warn',
        'vitest/no-duplicate-hooks': 'error',
        'vitest/no-focused-tests': 'error',
        'vitest/no-import-node-test': 'error',
        'vitest/no-standalone-expect': 'error',
        'vitest/no-test-return-statement': 'error',
        'vitest/prefer-comparison-matcher': 'error',
        'vitest/prefer-each': 'error',
        'vitest/prefer-equality-matcher': 'error',
        'vitest/prefer-hooks-in-order': 'error',
        'vitest/prefer-hooks-on-top': 'error',
        'vitest/prefer-mock-promise-shorthand': 'error',
        'vitest/prefer-strict-equal': 'error',
        'vitest/require-to-throw-message': 'error',
      },
    }
  )
  .append(
    {
      files: ['**/components/**/*.vue', '**/pages/**/*.vue'],
      rules: { 'vue/multi-word-component-names': 'off' },
    },
    // @ts-expect-error - RuleEntry
    eslintConfigPrettier
  )
