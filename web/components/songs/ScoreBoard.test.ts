import { isAreaUser } from '@ddradar/core'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import Oruga, { useProgrammatic } from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import { privateUser, testScores, testSongData } from '~~/../core/test/data'
import ScoreBoard from '~~/components/songs/ScoreBoard.vue'
import useAuth from '~~/composables/useAuth'
import { mountAsync } from '~~/test/test-utils'

const { useFetchMock } = vi.hoisted(() => ({ useFetchMock: vi.fn() }))
mockNuxtImport('useFetch', () => useFetchMock)

const open = vi.fn()
vi.mock('~~/composables/useAuth')
vi.mock('@oruga-ui/oruga-next', async origin => {
  const actual = (await origin()) as typeof import('@oruga-ui/oruga-next')
  return { ...actual, useProgrammatic: vi.fn() }
})
vi.mocked(useProgrammatic).mockReturnValue({
  oruga: { modal: { open } },
})

describe('components/songs/ScoreBoard.vue', () => {
  const props = {
    songId: testSongData.id,
    isCourse: false,
    chart: { ...testSongData.charts[0] },
  }
  const scores = testScores.map(s =>
    isAreaUser({ id: s.userId }) ? { ...s, isArea: true } : s
  )
  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })

    test('{ loading: true } renders loading state', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(true),
        data: ref([]),
      } as any)
      vi.mocked(useAuth).mockResolvedValue({
        id: ref(null),
        isLoggedIn: ref(false),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(ScoreBoard, {
        props,
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })

    test('{ scores: [...] } renders score board', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(false),
        data: ref(scores),
      } as any)
      vi.mocked(useAuth).mockResolvedValue({
        id: ref(privateUser.id),
        isLoggedIn: ref(true),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(ScoreBoard, {
        props,
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  // Method
  describe('editScore()', () => {
    test('calls open modal', async () => {
      // Arrange
      const i18n = createI18n({ legacy: false, locale: 'en' })
      const refresh = vi.fn()
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(false),
        data: ref(scores),
        refresh,
      } as any)
      vi.mocked(useAuth).mockResolvedValue({
        id: ref(null),
        isLoggedIn: ref(true),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */
      open.mockClear()
      open.mockReturnValue({ promise: Promise.resolve() })

      // Act
      const wrapper = await mountAsync(ScoreBoard, {
        props,
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })
      await wrapper.findAll('a.card-footer-item')[0].trigger('click')

      // Assert
      expect(open).toBeCalled()
      expect(refresh).toBeCalled()
    })
  })
  describe('reloadAll()', () => {
    test('calls refresh()', async () => {
      // Arrange
      const i18n = createI18n({ legacy: false, locale: 'en' })
      const refresh = vi.fn()
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(false),
        data: ref(scores),
        refresh,
      } as any)
      vi.mocked(useAuth).mockResolvedValue({
        id: ref(null),
        isLoggedIn: ref(false),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(ScoreBoard, {
        props,
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })
      await wrapper.find('a.card-footer-item').trigger('click')

      // Assert
      expect(refresh).toBeCalled()
    })
  })
})
