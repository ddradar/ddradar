import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const NuxtTsConfig = fs.readFileSync('./.nuxt/tsconfig.json').toString()
const tsConfigFormated = JSON.parse(
  NuxtTsConfig.replace(
    /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
    (m, g) => (g ? '' : m)
  )
)

export const alias: Record<string, string> = {
  '@ddradar/core/__tests__/data': '@ddradar/core/__tests__/data.ts',
  '@ddradar/core': '@ddradar/core/index.ts',
  '@ddradar/db': '@ddradar/db/index.ts',
}

Object.entries(tsConfigFormated.compilerOptions.paths).forEach(
  ([key, value]) => {
    alias[key] = resolve(__dirname, value[0])
  }
)

export default defineConfig({
  root: '.',
  plugins: [vue()],
  resolve: { alias },
  test: {
    environment: 'jsdom',
    coverage: {
      enabled: true,
      reporter: ['text', 'lcov'],
    },
  },
})
