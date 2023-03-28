import { defineEventHandler } from 'h3'
import { vi } from 'vitest'
import { computed, ref } from 'vue'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Vue 3
vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)

// Nuxt 3
vi.stubGlobal('useFetch', vi.fn())
vi.stubGlobal('useRoute', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn())
vi.stubGlobal('definePageMeta', vi.fn())
vi.stubGlobal('defineEventHandler', defineEventHandler)
