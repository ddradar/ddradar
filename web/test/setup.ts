import { defineEventHandler } from 'h3'
import { vi } from 'vitest'
import { computed, ref } from 'vue'

// Vue 3
vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)

// Nuxt 3
vi.stubGlobal('navigateTo', vi.fn())
vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('useFetch', vi.fn())
vi.stubGlobal('useRoute', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn())
vi.stubGlobal('useState', <T>(funcOrKey: string | (() => T), func?: () => T) =>
  typeof funcOrKey !== 'string'
    ? ref(funcOrKey())
    : func
    ? ref(func())
    : ref<T>()
)
vi.stubGlobal('definePageMeta', vi.fn())
vi.stubGlobal('defineEventHandler', defineEventHandler)
