import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { vi } from 'vitest'

const { queryCollectionMock, useToastMock, useUserSessionMock } = vi.hoisted(
  () => ({
    queryCollectionMock: vi.fn(),
    useToastMock: vi.fn<typeof useToast>(),
    useUserSessionMock: vi.fn(() => ({ fetch: vi.fn() })),
  })
)

mockNuxtImport('queryCollection', () => queryCollectionMock)
mockNuxtImport('useToast', () => useToastMock)
mockNuxtImport('useUserSession', () => useUserSessionMock)
