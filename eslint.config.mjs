// @ts-check
import eslintPluginOxlint from 'eslint-plugin-oxlint'
import { globalIgnores } from 'eslint/config'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  globalIgnores(['**/*.ts', '**/*.mts', '**/*.tsx']),
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
  eslintPluginOxlint.buildFromOxlintConfigFile('./.oxlintrc.jsonc')
)
