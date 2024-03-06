import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'

import { global } from '~/test/test-utils'
import { testCourseData } from '~~/../core/test/data'
import Page from '~~/pages/courses/[id].vue'

const { useFetchMock, useRouteMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  useRouteMock: vi.fn(),
}))
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useRoute', () => useRouteMock)

describe('/courses/[id]', () => {
  const params = { id: testCourseData.id }

  test('{ course: <Data> } renders course info', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ params } as any)
    vi.mocked(useFetch).mockResolvedValue({ data: ref(testCourseData) } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountSuspended(Page, { global })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })
})
