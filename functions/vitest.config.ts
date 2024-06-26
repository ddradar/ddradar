import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@ddradar/core/test/data': resolve(__dirname, '../core/test/data.ts'),
      '@ddradar/core': resolve(__dirname, '../core/src'),
    },
  },
  test: {
    coverage: { enabled: true, all: true, reporter: ['json', 'text'] },
  },
})
