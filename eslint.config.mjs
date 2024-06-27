// @ts-check
import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import node from 'eslint-plugin-n'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import vitest from 'eslint-plugin-vitest'
import typescript from 'typescript-eslint'

import withNuxt from './web/.nuxt/eslint.config.mjs'

export default withNuxt()
  .prepend(
    eslint.configs.recommended,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
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
          allowModules: ['@eslint/js', 'h3', 'ufo', 'vue-i18n'],
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
      rules: { ...vitest.configs.recommended.rules },
    }
  )
  .append(
    {
      files: ['**/components/**/*.vue', '**/pages/**/*.vue'],
      rules: { 'vue/multi-word-component-names': 'off' },
    },
    eslintConfigPrettier
  )
