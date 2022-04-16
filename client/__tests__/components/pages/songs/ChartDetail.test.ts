import { testSongData } from '@ddradar/core/__tests__/data'
import { mount, RouterLinkStub } from '@vue/test-utils'

import { createVue } from '~/__tests__/util'
import ChartDetail from '~/components/pages/songs/ChartDetail.vue'

const localVue = createVue()

describe('/components/pages/songs/ChartDetail.vue', () => {
  const song = { ...testSongData, charts: undefined }
  const chart = { ...testSongData.charts[0] }
  const propsData = { song, chart }
  const stubs = { NuxtLink: RouterLinkStub, ScoreBoard: true }

  describe('snapshot test', () => {
    test('renders correctly', () => {
      // Arrange - Act
      const wrapper = mount(ChartDetail, { localVue, propsData, stubs })

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })
})
