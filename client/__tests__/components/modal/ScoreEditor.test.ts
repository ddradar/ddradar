import { testSongData } from '@core/__tests__/data'
import { getDanceLevel, setValidScoreFromChart } from '@core/score'
import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import ScoreEditor from '~/components/modal/ScoreEditor.vue'
import * as popup from '~/utils/popup'

jest.mock('@core/score')
jest.mock('~/api/score')
jest.mock('~/utils/popup')
const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/modal/ScoreEditor.vue', () => {
  let wrapper: Wrapper<ScoreEditor>
  const propsData = {
    songId: testSongData.id,
    playStyle: testSongData.charts[0].playStyle,
    difficulty: testSongData.charts[0].difficulty,
    songData: testSongData,
  }
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  beforeEach(() => {
    wrapper = shallowMount(ScoreEditor, { localVue, propsData, i18n })
  })

  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    test('{ selectedChart: null } renders chart dropdown', () => {
      const wrapper = mount(ScoreEditor, {
        localVue,
        propsData: { ...propsData, playStyle: null, difficulty: null },
        i18n,
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('{ selectedChart: charts[0] } renders edit fields', () => {
      const wrapper = mount(ScoreEditor, { localVue, propsData, i18n })
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Computed
  describe('get rank()', () => {
    beforeEach(() => mocked(getDanceLevel).mockClear())
    test('{ isFailed: true } returns "E"', () => {
      // Arrange - Act
      wrapper.setData({ isFailed: true })
      // @ts-ignore
      const rank = wrapper.vm.rank

      // Assert
      expect(rank).toBe('E')
      expect(mocked(getDanceLevel)).not.toBeCalled()
    })
    test('{ isFailed: false } returns getDanceLevel()', () => {
      // Arrange
      const score = 800000
      mocked(getDanceLevel).mockClear()
      mocked(getDanceLevel).mockReturnValue('A')

      // Act
      wrapper.setData({ isFailed: false, score })
      // @ts-ignore
      const rank = wrapper.vm.rank

      // Assert
      expect(rank).toBe('A')
      expect(mocked(getDanceLevel)).toBeCalledWith(score)
    })
  })

  // Method
  describe('onChartSelected', () => {
    test('({ playStyle: 1, difficulty: 4 }) sets selectedChart: null', () => {
      // @ts-ignore
      wrapper.vm.onChartSelected({ playStyle: 1, difficulty: 4 })

      // @ts-ignore
      expect(wrapper.vm.selectedChart).toBeNull()
    })
    test('({ playStyle: 1, difficulty: 1 }) sets selectedChart: chart[1]', () => {
      // @ts-ignore
      wrapper.vm.onChartSelected({ playStyle: 1, difficulty: 1 })

      // @ts-ignore
      expect(wrapper.vm.selectedChart).toBe(testSongData.charts[1])
    })
  })
  describe('calcScore', () => {
    beforeEach(() => mocked(setValidScoreFromChart).mockReset())

    test('calls setValidScoreFromChart()', () => {
      // Arrange
      mocked(setValidScoreFromChart).mockReturnValue({
        score: 0,
        exScore: 0,
        clearLamp: 0,
        maxCombo: 0,
        rank: 'D',
      })

      // Act
      // @ts-ignore
      wrapper.vm.calcScore()

      // Assert
      expect(mocked(setValidScoreFromChart)).toBeCalled()
    })
    test('does not call setValidScoreFromChart() if { selectedChart: null }', () => {
      // Arrange
      wrapper.setData({ selectedChart: null })

      // Act
      // @ts-ignore
      wrapper.vm.calcScore()

      // Assert
      expect(mocked(setValidScoreFromChart)).not.toBeCalled()
    })
    test('calls popup.warning() if setValidScoreFromChart() throws error', () => {
      // Arrange
      mocked(setValidScoreFromChart).mockImplementation(() => {
        throw new Error('Invalid Score')
      })

      // Act
      // @ts-ignore
      wrapper.vm.calcScore()

      // Assert
      expect(mocked(setValidScoreFromChart)).toBeCalled()
      expect(mocked(popup.warning)).toBeCalled()
    })
  })
})
