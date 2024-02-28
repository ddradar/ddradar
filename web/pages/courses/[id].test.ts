import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { testCourseData } from '~~/../core/test/data'
import Page from '~~/pages/courses/[id].vue'
import { mountAsync } from '~~/test/test-utils'

const { useFetchMock, useRouteMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  useRouteMock: vi.fn(),
}))
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useRoute', () => useRouteMock)

describe('Page /courses/[id]', () => {
  const params = { id: testCourseData.id }

  test('{ course: null } renders loading state', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ params } as any)
    vi.mocked(useFetch).mockResolvedValue({ data: ref(null) } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountAsync(Page, {
      global: { plugins: [[Oruga, bulmaConfig]], stubs: { ChartInfo: true } },
    })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })

  test('{ course: <Data> } renders course info', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ params } as any)
    vi.mocked(useFetch).mockResolvedValue({ data: ref(testCourseData) } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountAsync(Page, {
      global: { plugins: [[Oruga, bulmaConfig]], stubs: { ChartInfo: true } },
    })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })
})
