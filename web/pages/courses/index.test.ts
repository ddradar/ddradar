import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import Oruga, { useProgrammatic } from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'
import { createI18n } from 'vue-i18n'

import { publicUser, testCourseData as course } from '~~/../core/test/data'
import Page from '~~/pages/courses/index.vue'
import { mountAsync } from '~~/test/test-utils'

const { useFetchMock, useRouteMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  useRouteMock: vi.fn(),
}))
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useRoute', () => useRouteMock)

const open = vi.fn()
vi.mock('@oruga-ui/oruga-next', async origin => {
  const actual = (await origin()) as typeof import('@oruga-ui/oruga-next')
  return { ...actual, useProgrammatic: vi.fn() }
})
vi.mocked(useProgrammatic).mockReturnValue({
  oruga: { modal: { open } },
})

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

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })

    test('{ isLoading: true } renders loading state', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useFetch).mockImplementation(path =>
        path === '/api/v1/user'
          ? { data: ref(null) }
          : ({ pending: ref(true), data: ref([]) } as any)
      )
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
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
      vi.mocked(useFetch).mockImplementation(path =>
        path === '/api/v1/user'
          ? { data: ref(null) }
          : ({ pending: ref(false), data: ref(courses) } as any)
      )
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ isLoggedIn: true } renders score edit button', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useFetch).mockImplementation(path =>
        path === '/api/v1/user'
          ? { data: ref(publicUser) }
          : ({ pending: ref(false), data: ref(courses) } as any)
      )
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
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
      vi.mocked(useFetch).mockImplementation(path =>
        path === '/api/v1/user'
          ? { data: ref(null) }
          : ({ pending: ref(false), data: ref([]) } as any)
      )
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  // Computed
  test.each([
    [undefined, undefined, 'COURSES'],
    [undefined, '16', 'COURSES (A20)'],
    ['1', '17', 'NONSTOP (A20 PLUS)'],
    ['2', '18', '段位認定 (A3)'],
  ])('?type=%s&series=%s renders "%s" title', async (type, series, title) => {
    // Arrange
    const i18n = createI18n({ legacy: false, locale: 'en' })
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ query: { type, series } } as any)
    vi.mocked(useFetch).mockImplementation(path =>
      path === '/api/v1/user'
        ? { data: ref(publicUser) }
        : ({ pending: ref(true), data: ref([]) } as any)
    )
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountAsync(Page, {
      global: {
        plugins: [[Oruga, bulmaConfig], i18n],
        stubs: { NuxtLink: RouterLinkStub },
      },
    })

    // Assert
    expect(wrapper.find('h1').text()).toBe(title)
  })

  // Method
  test('score edit button calls modal open', async () => {
    // Arrange
    const i18n = createI18n({ legacy: false, locale: 'en' })
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ query } as any)
    vi.mocked(useFetch).mockImplementation(path =>
      path === '/api/v1/user'
        ? { data: ref(publicUser) }
        : ({ pending: ref(false), data: ref(courses) } as any)
    )
    /* eslint-enable @typescript-eslint/no-explicit-any */
    open.mockClear()
    open.mockReturnValue({ promise: Promise.resolve() })

    // Act
    const wrapper = await mountAsync(Page, {
      global: {
        plugins: [[Oruga, bulmaConfig], i18n],
        stubs: { NuxtLink: RouterLinkStub },
      },
    })
    await wrapper.find('i.mdi-pencil-box-outline').trigger('click')

    // Assert
    expect(open).toBeCalled()
  })
})
