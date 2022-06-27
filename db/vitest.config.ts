import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@ddradar/core/__tests__/data': '@ddradar/core/__tests__/data.ts',
      '@ddradar/core': '@ddradar/core/index.ts',
    },
  },
  test: {
    threads: false,
    globalSetup: './__tests__/setup-database.ts',
    coverage: {
      enabled: true,
      all: true,
      reporter: ['json', 'text'],
      exclude: ['database.ts'],
    },
  },
})
