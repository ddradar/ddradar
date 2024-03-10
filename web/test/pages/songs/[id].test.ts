import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'

import { testSongData } from '~/../core/test/data'
import Page from '~/pages/songs/[id].vue'
import { global } from '~/test/test-utils'

const { useEasyAuthMock, useFetchMock, useRouteMock } = vi.hoisted(() => ({
  useEasyAuthMock: vi.fn(),
  useFetchMock: vi.fn(),
  useRouteMock: vi.fn(),
}))
mockNuxtImport('useEasyAuth', () => useEasyAuthMock)
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useRoute', () => useRouteMock)

describe('/songs/[id]', () => {
  const params = { id: testSongData.id }

  test('{ song: <Data> } renders song info', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ params } as any)
    vi.mocked(useEasyAuth).mockResolvedValue({
      hasRole: () => ref(false),
    } as any)
    vi.mocked(useFetch).mockResolvedValue({ data: ref(testSongData) } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountSuspended(Page, { global })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })

  test('{ isAdmin: true } renders edit button', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ params } as any)
    vi.mocked(useEasyAuth).mockResolvedValue({
      hasRole: () => ref(true),
    } as any)
    vi.mocked(useFetch).mockResolvedValue({ data: ref(testSongData) } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountSuspended(Page, { global })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })
})
