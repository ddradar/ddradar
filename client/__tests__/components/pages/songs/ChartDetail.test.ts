import { testSongData } from '@core/__tests__/data'
import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'

import ChartDetail from '~/components/pages/songs/ChartDetail.vue'

jest.mock('~/api/score')
const localVue = createLocalVue()
localVue.use(Buefy)

describe('/components/pages/songs/ChartDetail.vue', () => {
  const info = { ...testSongData, charts: undefined }
  const chart = { ...testSongData.charts[0] }
  const propsData = { info, chart }
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
