import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'

import { testSongData } from '~/../core/test/data'
import Page from '~/pages/admin/songs/[[id]].vue'
import { global } from '~/test/test-utils'

const { useFetchMock, useRouteMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  useRouteMock: vi.fn(),
}))
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useRoute', () => useRouteMock)

describe('/admin/songs', () => {
  test('snapshot test', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({
      params: { id: testSongData.id },
    } as any)
    vi.mocked(useFetch).mockReturnValue({
      data: ref(testSongData),
      refresh: vi.fn(),
    } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountSuspended(Page, { global })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })
})
