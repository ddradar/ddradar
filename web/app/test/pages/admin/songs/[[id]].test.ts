import { testSongData } from '@ddradar/core/test/data'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'

import Page from '~/pages/admin/songs/[[id]].vue'
import { global } from '~/test/utils'

const { useFetchMock, useRouteMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  useRouteMock: vi.fn(),
}))
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useRoute', () => useRouteMock)

describe('/admin/songs', () => {
  test('snapshot test', async () => {
    // Arrange
    vi.mocked(useRoute).mockReturnValue({
      params: { id: testSongData.id },
    } as unknown as ReturnType<typeof useRoute>)
    vi.mocked(useFetch).mockReturnValue({
      data: ref(testSongData),
      execute: vi.fn(),
    } as unknown as ReturnType<typeof useFetch>)

    // Act
    const wrapper = await mountSuspended(Page, { global })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })
})
