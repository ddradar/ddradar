import Vue3Plugin from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [Vue3Plugin()],
  resolve: {
    alias: [{ find: /^~(?=\/)/, replacement: resolve('./') }],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['cobertura', 'text'],
      include: ['**/*.ts', '**/*.vue'],
      exclude: ['*.config.ts', '**/*.d.ts', '**/__tests__/**'],
    },
  },
})
