import { ClearLamp, clearLampMap, danceLevelSet } from '@core/db/scores'
import type { GrooveRadar } from '@core/db/songs'
import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { getClearStatus, getGrooveRadar, getScoreStatus } from '~/api/user'
import PlayStatus from '~/components/pages/users/PlayStatus.vue'

jest.mock('~/api/user')

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/pages/users/PlayStatus.vue', () => {
  const userId = 'foo_user'
  const mocks = { $fetchState: { pending: false }, $http: {} }
  const propsData = { userId, playStyle: 1 }
  const radar: GrooveRadar = {
    stream: 120,
    voltage: 102,
    air: 160,
    freeze: 200,
    chaos: 103,
  }
  const clears = [...Array(20).keys()].map(i => ({
    level: i,
    title: i === 0 ? 'ALL' : `${i}`,
    statuses: [...clearLampMap.keys(), -1 as const].map(clearLamp => ({
      clearLamp,
      count: (clearLamp + 2) * 10,
    })),
  }))
  const scores = [...Array(20).keys()].map(i => ({
    level: i,
    title: i === 0 ? 'ALL' : `${i}`,
    statuses: [...danceLevelSet].map((rank, j) => ({
      rank,
      count: (j + 1) * 10,
    })),
  }))

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    const stubs = ['GrooveRadar', 'ClearStatus', 'ScoreStatus']

    test('renders loading state before fetch()', async () => {
      const mocks = { $fetchState: { pending: true } }
      const options = { localVue, mocks, stubs, propsData, i18n }
      const wrapper = mount(PlayStatus, options)
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
    test('renders graphs correctly', async () => {
      const data = () => ({ clears, scores, radar })
      const options = { localVue, mocks, stubs, propsData, data, i18n }
      const wrapper = mount(PlayStatus, options)
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
    test('renders no data if empty', async () => {
      const options = { localVue, mocks, stubs, propsData, i18n }
      const wrapper = mount(PlayStatus, options)
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Lifecycle
  describe('fetch()', () => {
    let wrapper: Wrapper<PlayStatus>
    const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
    const propsData = { userId, playStyle: 1 }
    beforeEach(() => {
      wrapper = shallowMount(PlayStatus, { localVue, i18n, mocks, propsData })
      mocked(getGrooveRadar).mockClear()
      mocked(getClearStatus).mockClear()
      mocked(getScoreStatus).mockClear()
    })

    test('calls getClearStatus(), getGrooveRadar(), and getScoreStatus()', async () => {
      // Arrange
      mocked(getGrooveRadar).mockResolvedValueOnce([{ ...radar, playStyle: 1 }])
      mocked(getClearStatus).mockResolvedValueOnce(
        [...Array(19 * (clearLampMap.size + 1)).keys()].map(i => ({
          playStyle: 1,
          level: (i % 19) + 1,
          clearLamp: ((i % (clearLampMap.size + 1)) - 1) as ClearLamp | -1,
          count: ((i % (clearLampMap.size + 1)) + 1) * 10,
        }))
      )
      mocked(getScoreStatus).mockResolvedValueOnce(
        [...Array(19 * (danceLevelSet.size + 1)).keys()].map(i => ({
          playStyle: 1,
          level: (i % 19) + 1,
          rank: [...danceLevelSet][i % (danceLevelSet.size + 1)] ?? '-',
          count: ((i % (danceLevelSet.size + 1)) + 1) * 10,
        }))
      )

      // Act
      await wrapper.vm.$options.fetch?.call(wrapper.vm, null!)

      // Assert
      expect(mocked(getGrooveRadar)).toBeCalledWith(mocks.$http, userId, 1)
      expect(mocked(getClearStatus)).toBeCalledWith(mocks.$http, userId, 1)
      expect(mocked(getScoreStatus)).toBeCalledWith(mocks.$http, userId, 1)
      expect(wrapper.vm.$data.radar).toBeTruthy()
      expect(wrapper.vm.$data.clears).toHaveLength(20)
      expect(wrapper.vm.$data.scores).toHaveLength(20)
    })

    test('sets { radar: null, clears: [], scores: [] } if error caused', async () => {
      // Arrange
      mocked(getGrooveRadar).mockRejectedValueOnce('Error')
      mocked(getClearStatus).mockRejectedValueOnce('Error')
      mocked(getScoreStatus).mockRejectedValueOnce('Error')

      // Act
      await wrapper.vm.$options.fetch?.call(wrapper.vm, null!)

      // Assert
      expect(wrapper.vm.$data.radar).toBeNull()
      expect(wrapper.vm.$data.clears).toHaveLength(0)
      expect(wrapper.vm.$data.scores).toHaveLength(0)
    })
  })
})
