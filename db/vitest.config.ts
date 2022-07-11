import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@ddradar/core': resolve(__dirname, '../core/index.ts'),
      '@ddradar/core/__tests__/data': resolve(
        __dirname,
        '../core/__tests__/data.ts'
      ),
    },
  },
  test: {
    threads: false,
    globalSetup: './__tests__/setup-database.ts',
    coverage: {
      enabled: true,
      all: true,
      reporter: ['json', 'text'],
      exclude: [
        'dist/**',
        'index.ts',
        'database.ts',
        '*.config.ts',
        '*.d.ts',
        '**/__tests__/**',
      ],
    },
  },
})
