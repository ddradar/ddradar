import { publicUser, testSongData as song } from '@ddradar/core/test/data'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'
import { createI18n } from 'vue-i18n'

import Page from '~/pages/charts.vue'
import { locales } from '~/test/utils'

const { useFetchMock, useRouteMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  useRouteMock: vi.fn(),
}))
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useRoute', () => useRouteMock)

describe('/charts', () => {
  const query = { style: '1', level: '16' }
  const charts = song.charts.map(c => ({
    id: song.id,
    name: song.name,
    series: song.series,
    playStyle: c.playStyle,
    difficulty: c.difficulty,
    level: c.level,
  }))

  describe.each(locales)('{ locale: "%s" } snapshot test', locale => {
    const global = { plugins: [createI18n({ locale, legacy: false })] }

    test('{ status: "pending" } renders loading state', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useFetch).mockImplementation(path =>
        path === '/api/v2/user'
          ? { data: ref(null) }
          : ({ status: 'pending', data: ref([]) } as any)
      )
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ status: "success", charts: <Data> } renders chart list', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useFetch).mockImplementation(path =>
        path === '/api/v2/user'
          ? { data: ref(null) }
          : ({ status: 'success', data: ref(charts) } as any)
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
        path === '/api/v2/user'
          ? { data: ref(publicUser) }
          : ({ status: 'success', data: ref(charts) } as any)
      )
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ status: "success", songs: [] } renders no data', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useFetch).mockImplementation(path =>
        path === '/api/v2/user'
          ? { data: ref(null) }
          : ({ status: 'success', data: ref([]) } as any)
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
    ['1', '6', 'SINGLE 6'],
    ['2', '18', 'DOUBLE 18'],
  ])('?style=%s&level=%s renders "%s" title', async (style, level, title) => {
    // Arrange
    const global = { plugins: [createI18n({ locale: 'ja', legacy: false })] }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ query: { style, level } } as any)
    vi.mocked(useFetch).mockImplementation(path =>
      path === '/api/v2/user'
        ? { data: ref(null) }
        : ({ status: 'pending', data: ref([]) } as any)
    )
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountSuspended(Page, { global })

    // Assert
    expect(wrapper.find('h1').text()).toBe(title)
  })
})
