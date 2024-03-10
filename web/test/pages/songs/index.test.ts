import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'
import { createI18n } from 'vue-i18n'

import { publicUser, testSongList as songs } from '~/../core/test/data'
import Page from '~/pages/songs/index.vue'
import { global, locales } from '~/test/test-utils'

const { useFetchMock, useRouteMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  useRouteMock: vi.fn(),
}))
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useRoute', () => useRouteMock)

describe('/songs', () => {
  const query = { series: '10' }

  describe.each(locales)('{ locale: "%s" }', locale => {
    const global = { plugins: [createI18n({ locale, legacy: false })] }

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
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ isLoading: false, songs: <Data> } renders song list', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useFetch).mockImplementation(path =>
        path === '/api/v1/user'
          ? { data: ref(null) }
          : ({ pending: ref(false), data: ref(songs) } as any)
      )
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(Page, { global })

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
          : ({ pending: ref(false), data: ref(songs) } as any)
      )
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(false),
        data: ref(songs),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(Page, { global })

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
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  // Computed
  test.each([
    [undefined, undefined, 'すべての楽曲を表示'],
    [undefined, '18', 'DanceDanceRevolution A3'],
    ['1', undefined, 'か'],
  ])('?name=%s&series=%s renders "%s" title', async (name, series, title) => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ query: { name, series } } as any)
    vi.mocked(useFetch).mockImplementation(path =>
      path === '/api/v1/user'
        ? { data: ref(null) }
        : ({ pending: ref(true), data: ref([]) } as any)
    )
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountSuspended(Page, { global })

    // Assert
    expect(wrapper.find('h1').text()).toBe(title)
  })
  test.each([
    ['ja', 'すべての楽曲を表示'],
    ['en', 'Show All Songs'],
  ])('{ locale: "%s" } renders "%s" title', async (locale, title) => {
    // Arrange
    const global = { plugins: [createI18n({ legacy: false, locale })] }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ query: {} } as any)
    vi.mocked(useFetch).mockImplementation(path =>
      path === '/api/v1/user'
        ? { data: ref(null) }
        : ({ pending: ref(true), data: ref([]) } as any)
    )
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountSuspended(Page, { global })

    // Assert
    expect(wrapper.find('h1').text()).toBe(title)
  })
})
