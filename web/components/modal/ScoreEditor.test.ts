import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import { testCourseData, testSongData } from '~~/../core/test/data'
import ScoreEditor from '~~/components/modal/ScoreEditor.vue'
import { mountAsync } from '~~/test/test-utils'

const { useFetchMock } = vi.hoisted(() => ({ useFetchMock: vi.fn() }))
mockNuxtImport('useFetch', () => useFetchMock)

describe('components/modal/ScoreEditor.vue', () => {
  beforeEach(() => {
    vi.mocked(useFetch).mockClear()
  })

  describe.skip.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })

    test(`{ songId: "${testSongData.id}", isCourse: false, playstyle: 1, difficulty: 0 } renders score input form`, async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useFetch).mockImplementation(req =>
        req.toString().includes('scores')
          ? ({ pending: ref(false), refresh: vi.fn() } as any)
          : { data: ref(testSongData) }
      )
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(ScoreEditor, {
        props: {
          songId: testSongData.id,
          isCourse: false,
          playStyle: testSongData.charts[0].playStyle,
          difficulty: testSongData.charts[0].difficulty,
        },
        global: { plugins: [[Oruga, bulmaConfig], i18n] },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
      expect(vi.mocked(useFetch)).toBeCalledWith(
        `/api/v1/songs/${testSongData.id}`,
        expect.any(String)
      )
    })

    test(`{ songId: "${testSongData.id}", isCourse: false } renders label.selectChart`, async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useFetch).mockImplementation(req =>
        req.toString().includes('scores')
          ? ({ pending: ref(false), refresh: vi.fn() } as any)
          : { data: ref(testSongData) }
      )
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(ScoreEditor, {
        props: { songId: testSongData.id, isCourse: false },
        global: { plugins: [[Oruga, bulmaConfig], i18n] },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
      expect(vi.mocked(useFetch)).toBeCalledWith(
        `/api/v1/songs/${testSongData.id}`,
        expect.any(String)
      )
    })
  })

  // Hooks
  test(`{ songId: "${testCourseData.id}", isCourse: true } calls Course API`, async () => {
    // Arrange
    const i18n = createI18n({ legacy: false, locale: 'en' })
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useFetch).mockImplementation(req =>
      req.toString().includes('scores')
        ? ({ pending: ref(false), refresh: vi.fn() } as any)
        : { data: ref(testCourseData) }
    )
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    await mountAsync(ScoreEditor, {
      props: { songId: testCourseData.id, isCourse: true },
      global: { plugins: [[Oruga, bulmaConfig], i18n] },
    })

    // Assert
    expect(vi.mocked(useFetch)).toBeCalledWith(
      `/api/v1/courses/${testCourseData.id}`,
      expect.any(String)
    )
  })
})
