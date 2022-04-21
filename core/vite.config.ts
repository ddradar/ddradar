import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: 'json',
      reportsDirectory: './coverage/',
      include: ['**/*.ts'],
      exclude: [
        '**/index.ts',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/__tests__/**',
      ],
    },
  },
})
