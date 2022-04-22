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
    testTimeout: 20000,
    hookTimeout: 50000,
    coverage: {
      reporter: ['json', 'text'],
      include: ['**/*.ts'],
      exclude: [
        './database.ts',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/__tests__/**',
      ],
    },
  },
})
