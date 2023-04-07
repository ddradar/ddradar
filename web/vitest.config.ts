import fs from 'node:fs'
import { resolve } from 'node:path'

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const NuxtTsConfig = fs.readFileSync('./.nuxt/tsconfig.json').toString()
const tsConfigFormated = JSON.parse(
  NuxtTsConfig.replace(
    /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
    (m, g) => (g ? '' : m)
  )
)

export const alias: Record<string, string> = {
  '@ddradar/core/test/data': resolve(__dirname, '../core/test/data.ts'),
  '@ddradar/core': resolve(__dirname, '../core/src'),
  '@ddradar/db': resolve(__dirname, '../db/src'),
}

Object.entries(
  tsConfigFormated.compilerOptions.paths as Record<string, string[]>
).forEach(([key, value]) => {
  alias[key] = resolve(__dirname, value[0])
})

export default defineConfig({
  root: '.',
  plugins: [vue(), VueI18nPlugin({ compositionOnly: true })],
  resolve: { alias },
  test: {
    environment: 'happy-dom',
    setupFiles: './test/setup.ts',
    coverage: {
      enabled: true,
      all: true,
      reporter: ['json', 'text'],
      include: ['**/*.ts', '**/*.vue'],
      exclude: [
        '.nuxt/**',
        'plugins/**',
        'test/**',
        '**.config.ts',
        '**.d.ts',
        '**/*.test.ts',
        'app.vue',
      ],
    },
  },
})
