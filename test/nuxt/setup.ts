import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { vi } from 'vitest'

const { useToastMock, useUserSessionMock } = vi.hoisted(() => ({
  useToastMock: vi.fn<typeof useToast>(),
  useUserSessionMock: vi.fn(() => ({ fetch: vi.fn() })),
}))

mockNuxtImport('useToast', () => useToastMock)
mockNuxtImport('useUserSession', () => useUserSessionMock)
