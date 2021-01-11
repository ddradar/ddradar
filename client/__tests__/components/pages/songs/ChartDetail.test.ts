import { privateUser, publicUser, testSongData } from '@core/__tests__/data'
import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'
import VueI18n from 'vue-i18n'

import ChartDetail from '~/components/pages/songs/ChartDetail.vue'

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/pages/songs/ChartDetail.vue', () => {
  const song = { ...testSongData, charts: undefined }
  const chart = { ...testSongData.charts[0] }
  const $accessor = { isLoggedIn: true, user: { ...privateUser } }
  const scores = [
    {
      userId: '0',
      userName: '0',
      clearLamp: 7,
      score: 1000000,
      exScore: chart.notes * 3,
      isArea: true,
    },
    {
      userId: '13',
      userName: '13',
      clearLamp: 6,
      score: 999950,
      exScore: chart.notes * 3 - 5,
      isArea: true,
    },
    {
      userId: publicUser.id,
      userName: publicUser.name,
      clearLamp: 6,
      score: 999950,
      exScore: chart.notes * 3 - 5,
    },
    {
      userId: privateUser.id,
      userName: privateUser.name,
      clearLamp: 6,
      score: 999930,
      exScore: chart.notes * 3 - 5,
    },
  ]

  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    const propsData = { song, chart }
    const stubs = { NuxtRouterLink: RouterLinkStub, ScoreBadge: true }
    const mocks = { $accessor: { isLoggedIn: false } }
    const wrapper = mount(ChartDetail, {
      localVue,
      propsData,
      mocks,
      stubs,
      i18n,
    })

    test('{ loading: true } renders loading spin', async () => {
      // Arrange - Act
      wrapper.setData({ loading: true, scores: [] })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [...] } renders score list', async () => {
      // Arrange - Act
      wrapper.setData({ loading: false, scores })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [] } renders empty', async () => {
      // Arrange - Act
      wrapper.setData({ loading: false, scores: [] })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('renders edit button if loggedIn', async () => {
      // Arrange - Act
      const mocks = { $accessor }
      const wrapper = mount(ChartDetail, {
        localVue,
        propsData,
        mocks,
        stubs,
        i18n,
      })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })
})
