import { resolve } from 'node:path'

import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: [
        'app/components/**/*.vue',
        'app/pages/**/*.vue',
        'shared/**/*.ts',
        'server/api/**/*.ts',
      ],
      exclude: ['**/*.d.ts'],
    },
    projects: [
      {
        resolve: {
          alias: {
            '~~': resolve(__dirname, './'),
          },
        },
        test: {
          name: 'unit',
          include: ['test/{e2e,unit}/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
