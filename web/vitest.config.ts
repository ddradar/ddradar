import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  root: '.',
  test: {
    environment: 'nuxt',
    setupFiles: './test/setup.ts',
    coverage: {
      enabled: true,
      all: true,
      reporter: ['json', 'text'],
      include: ['**/*.ts', '**/*.vue'],
      exclude: [
        '.nuxt/**',
        'plugins/**',
        'test/**',
        '**.config.ts',
        '**.d.ts',
        '**/*.test.ts',
        'app.vue',
      ],
    },
  },
})
