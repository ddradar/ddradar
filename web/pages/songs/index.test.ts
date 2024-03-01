import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import Oruga, { useProgrammatic } from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'
import { createI18n } from 'vue-i18n'

import { publicUser, testSongList as songs } from '~~/../core/test/data'
import Page from '~~/pages/songs/index.vue'
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

describe('Page /songs', () => {
  const query = { series: '10' }

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
          : ({ pending: ref(false), data: ref(songs) } as any)
      )
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(false),
        data: ref(songs),
      } as any)
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
    [undefined, undefined, 'すべての楽曲を表示'],
    [undefined, '18', 'DanceDanceRevolution A3'],
    ['1', undefined, 'か'],
  ])('?name=%s&series=%s renders "%s" title', async (name, series, title) => {
    // Arrange
    const i18n = createI18n({ legacy: false, locale: 'en' })
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ query: { name, series } } as any)
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
        : ({ pending: ref(false), data: ref(songs) } as any)
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
