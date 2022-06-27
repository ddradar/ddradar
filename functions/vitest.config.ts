import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@ddradar/core/__tests__/data': '@ddradar/core/__tests__/data.ts',
      '@ddradar/core': '@ddradar/core/index.ts',
      '@ddradar/db': '@ddradar/db/index.ts',
    },
  },
  test: {
    coverage: { enabled: true, all: true, reporter: ['json', 'text'] },
  },
})