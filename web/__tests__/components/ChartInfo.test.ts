import { testCourseData, testSongData } from '@ddradar/core/test/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import ChartInfo from '~/components/ChartInfo.vue'

describe('components/ChartInfo.vue', () => {
  const testProps = {
    SongChart: testSongData.charts[0],
    CourseChart: testCourseData.charts[1],
  }
  test.each(['SongChart', 'CourseChart'] as const)(
    '({ chart: %s }) snapshot test',
    key => {
      const wrapper = mount(ChartInfo, {
        props: { chart: testProps[key] },
        global: {
          plugins: [[Oruga, bulmaConfig]],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })
      expect(wrapper.element).toMatchSnapshot()
    }
  )
})
