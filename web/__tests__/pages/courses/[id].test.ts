import { testCourseData } from '@ddradar/core/__tests__/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { mountAsync } from '~/__tests__/test-utils'
import Page from '~/pages/courses/[id].vue'

describe('Page /courses/[id]', () => {
  const params = { id: testCourseData.id }

  test('{ isLoading: true } renders loading state', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ params } as any)
    vi.mocked(useFetch).mockResolvedValue({
      pending: ref(true),
      data: ref(testCourseData),
    } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountAsync(Page, {
      global: { plugins: [[Oruga, bulmaConfig]], stubs: { ChartInfo: true } },
    })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })

  test('{ isLoading: false, course: <Data> } renders course info', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ params } as any)
    vi.mocked(useFetch).mockResolvedValue({
      pending: ref(false),
      data: ref(testCourseData),
    } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountAsync(Page, {
      global: { plugins: [[Oruga, bulmaConfig]], stubs: { ChartInfo: true } },
    })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })
})
