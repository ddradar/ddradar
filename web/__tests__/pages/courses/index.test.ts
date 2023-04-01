import { testCourseData as course } from '@ddradar/core/test/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { mountAsync } from '~/__tests__/test-utils'
import Page from '~/pages/courses/index.vue'

describe('Page /courses', () => {
  const query = { type: '1', series: '16' }
  const courses = [
    {
      id: course.id,
      name: course.name,
      series: course.series,
      charts: course.charts.map(c => ({
        playStyle: c.playStyle,
        difficulty: c.difficulty,
        level: c.level,
      })),
    },
  ]

  describe('snapshot tests', () => {
    test('{ isLoading: true } renders loading state', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(true),
        data: ref([]),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: {
          plugins: [[Oruga, bulmaConfig]],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ isLoading: false, courses: <Data> } renders course list', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(false),
        data: ref(courses),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: {
          plugins: [[Oruga, bulmaConfig]],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ isLoading: false, courses: [] } renders no data', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(false),
        data: ref([]),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: {
          plugins: [[Oruga, bulmaConfig]],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  test.each([
    [undefined, undefined, 'COURSES'],
    [undefined, '16', 'COURSES (A20)'],
    ['1', '17', 'NONSTOP (A20 PLUS)'],
    ['2', '18', '段位認定 (A3)'],
  ])('?type=%s&series=%s renders "%s" title', async (type, series, title) => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ query: { type, series } } as any)
    vi.mocked(useFetch).mockResolvedValue({
      pending: ref(true),
      data: ref([]),
    } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountAsync(Page, {
      global: {
        plugins: [[Oruga, bulmaConfig]],
        stubs: { NuxtLink: RouterLinkStub },
      },
    })

    // Assert
    expect(wrapper.find('h1').text()).toBe(title)
  })
})
