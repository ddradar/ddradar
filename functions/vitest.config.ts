import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@ddradar/core/__tests__/data': resolve(
        __dirname,
        '../core/__tests__/data.ts'
      ),
      '@ddradar/core': resolve(__dirname, '../core/src'),
      '@ddradar/db': resolve(__dirname, '../db/src'),
    },
  },
  test: {
    coverage: { enabled: true, all: true, reporter: ['json', 'text'] },
  },
})
