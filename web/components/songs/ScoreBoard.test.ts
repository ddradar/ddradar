import { difficultyMap, isAreaUser, isPageDeletedOnGate } from '@ddradar/core'
import {
  privateUser,
  publicUser,
  testCourseData,
  testScores,
  testSongData,
} from '@ddradar/core/test/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import ScoreBoard from '~~/components/songs/ScoreBoard.vue'
import useAuth from '~~/composables/useAuth'
import { mountAsync } from '~~/test/test-utils'

vi.mock('~~/composables/useAuth')

describe('components/songs/ScoreBoard.vue', () => {
  const props = {
    songId: testSongData.id,
    chart: { ...testSongData.charts[0] },
  }
  const scores = testScores.map(s =>
    isAreaUser({ id: s.userId }) ? { ...s, isArea: true } : s
  )
  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })

    test('{ pending: true } renders loading state', async () => {
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
})
