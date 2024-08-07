import { testSongData } from '@ddradar/core/test/data'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import { createI18n } from 'vue-i18n'

import ChartInfo from '~/components/song/ChartInfo.vue'
import { locales } from '~/test/utils'

describe('components/song/ChartInfo.vue', () => {
  describe.each(locales)('{ locale: "%s" }', locale => {
    const global = { plugins: [createI18n({ locale, legacy: false })] }

    test.each([...testSongData.charts])(
      '{ chart: %o } snapshot test',
      async chart => {
        // Arrange - Act
        const wrapper = await mountSuspended(ChartInfo, {
          global,
          props: { chart },
        })
        // Assert
        expect(wrapper.element).toMatchSnapshot()
      }
    )
  })
})
