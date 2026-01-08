// @ts-check
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
  }
)
