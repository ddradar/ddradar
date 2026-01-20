import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { vi } from 'vitest'

const {
  navigateToMock,
  queryCollectionMock,
  useToastMock,
  useUserSessionMock,
} = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  queryCollectionMock: vi.fn(),
  useToastMock: vi.fn<typeof useToast>(),
  useUserSessionMock: vi.fn(() => ({ fetch: vi.fn() })),
}))

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('queryCollection', () => queryCollectionMock)
mockNuxtImport('useToast', () => useToastMock)
mockNuxtImport('useUserSession', () => useUserSessionMock)
