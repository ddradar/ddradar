import { resolve } from 'node:path'

import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      // Use Istanbul provider to avoid remapping issues with Nuxt/Vite SSR wrappers
      provider: 'istanbul',
      include: [
        'app/components/**/*.vue',
        'app/composables/**/*.ts',
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
            '#shared': resolve(__dirname, './shared'),
          },
        },
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
          setupFiles: ['test/unit/setup.ts'],
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
