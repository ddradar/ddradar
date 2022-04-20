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
    coverage: {
      reporter: 'lcov',
      reportsDirectory: './coverage/',
      include: ['**/*.ts'],
      exclude: ['**/*.d.ts', '<rootDir>/*.config.ts', '**/__tests__/**'],
    },
  },
})
