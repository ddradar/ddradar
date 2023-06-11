import { testCourseData, testSongData } from '@ddradar/core/test/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import ChartInfo from '~~/components/songs/ChartInfo.vue'

describe('components/songs/ChartInfo.vue', () => {
  test.each([
    { songId: testSongData.id, chart: testSongData.charts[0] },
    { songId: testCourseData.id, chart: testCourseData.charts[1] },
  ])('(%o) snapshot test', props => {
    const wrapper = mount(ChartInfo, {
      props,
      global: {
        plugins: [[Oruga, bulmaConfig]],
        stubs: { NuxtLink: RouterLinkStub, ScoreBoard: true },
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
