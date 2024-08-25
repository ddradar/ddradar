import { resolve } from 'node:path'

import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  root: '.',
  resolve: {
    alias: {
      '@ddradar/core/test/data': resolve(__dirname, '../core/test/data.ts'),
      '@ddradar/core': resolve(__dirname, '../core/src'),
      '@ddradar/db': resolve(__dirname, '../db/src'),
    },
  },
  test: {
    environment: 'nuxt',
    setupFiles: './test-setup.ts',
    coverage: {
      enabled: true,
      all: true,
      reporter: ['json', 'text'],
      include: ['**/*.ts', '**/*.vue'],
      exclude: ['.nuxt/**', 'test/**', '**/*.config.ts', '**/*.test.ts'],
    },
  },
})
