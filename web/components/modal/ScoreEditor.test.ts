import { testSongData } from '@ddradar/core/test/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import ScoreEditor from '~~/components/modal/ScoreEditor.vue'
import { mountAsync } from '~~/test/test-utils'

describe('components/modal/ScoreEditor.vue', () => {
  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })

    test('{ info: {...}, playstyle: 1, difficulty: 0 } renders score input form', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(false),
        refresh: vi.fn(),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(ScoreEditor, {
        props: {
          info: testSongData,
          playStyle: testSongData.charts[0].playStyle,
          difficulty: testSongData.charts[0].difficulty,
        },
        global: { plugins: [[Oruga, bulmaConfig], i18n] },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })

    test('{ info: {...} } renders label.selectChart', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useFetch).mockResolvedValue({
        pending: ref(false),
        refresh: vi.fn(),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(ScoreEditor, {
        props: { info: testSongData },
        global: { plugins: [[Oruga, bulmaConfig], i18n] },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })
})
