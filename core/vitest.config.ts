import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: { enabled: true, all: true, reporter: ['json', 'text'] },
  },
})
