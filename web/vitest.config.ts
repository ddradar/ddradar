import fs from 'node:fs'
import { resolve } from 'node:path'

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
  '@ddradar/db': resolve(__dirname, '../db/src'),
}

Object.entries(
  tsConfigFormated.compilerOptions.paths as Record<string, string[]>
).forEach(([key, value]) => {
  alias[key] = resolve(__dirname, value[0])
})

export default defineConfig({
  root: '.',
  plugins: [vue()],
  resolve: { alias },
  test: {
    environment: 'jsdom',
    setupFiles: './__tests__/setup.ts',
    coverage: {
      enabled: true,
      all: true,
      reporter: ['json', 'text'],
      include: ['**/*.ts', '**/*.vue'],
      exclude: [
        '**.config.ts',
        '**.d.ts',
        '**/__tests__/**',
        '.nuxt/**',
        'plugins/**',
        'app.vue',
      ],
    },
  },
})
