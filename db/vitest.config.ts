import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@ddradar/core/test/data': resolve(__dirname, '../core/test/data.ts'),
    },
  },
  test: {
    threads: false,
    globalSetup: './__tests__/setup-database.ts',
    hookTimeout: 20000,
    testTimeout: 10000,
    coverage: {
      enabled: true,
      all: true,
      reporter: ['json', 'text'],
      exclude: [
        'dist/**',
        '**/index.ts',
        '**/database.ts',
        '*.config.ts',
        '*.d.ts',
        '**/__tests__/**',
      ],
    },
  },
})
