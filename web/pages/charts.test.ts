import { testSongData as song } from '@ddradar/core/test/data'
import Oruga, { useProgrammatic } from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'

import useAuth from '~~/composables/useAuth'
import Page from '~~/pages/charts.vue'
import { mountAsync } from '~~/test/test-utils'

const open = vi.fn()
vi.mock('~~/composables/useAuth')
vi.mock('@oruga-ui/oruga-next', async origin => {
  const actual = (await origin()) as typeof import('@oruga-ui/oruga-next')
  return { ...actual, useProgrammatic: vi.fn() }
})
vi.mocked(useProgrammatic).mockReturnValue({
  oruga: { modal: { open } },
})

describe('Page /charts', () => {
  const query = { style: '1', level: '16' }
  const charts = song.charts.map(c => ({
    id: song.id,
    name: song.name,
    series: song.series,
    playStyle: c.playStyle,
    difficulty: c.difficulty,
    level: c.level,
  }))

  describe('snapshot tests', () => {
    test('{ isLoading: true } renders loading state', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useAuth).mockResolvedValue({ isLoggedIn: ref(false) } as any)
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
    test('{ isLoading: false, songs: <Data> } renders course list', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useAuth).mockResolvedValue({ isLoggedIn: ref(false) } as any)
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(false),
        data: ref(charts),
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
    test('{ isLoggedIn: true } renders score edit button', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useAuth).mockResolvedValue({ isLoggedIn: ref(true) } as any)
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(false),
        data: ref(charts),
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
    test('{ isLoading: false, songs: [] } renders no data', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ query } as any)
      vi.mocked(useAuth).mockResolvedValue({ isLoggedIn: ref(false) } as any)
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
    ['1', '6', 'SINGLE 6'],
    ['2', '18', 'DOUBLE 18'],
  ])('?style=%s&level=%s renders "%s" title', async (style, level, title) => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ query: { style, level } } as any)
    vi.mocked(useAuth).mockResolvedValue({ isLoggedIn: ref(false) } as any)
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
