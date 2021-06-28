import { Api, Score } from '@ddradar/core'
import { testSongData } from '@ddradar/core/__tests__/data'
import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { deleteChartScore, getChartScore, postChartScore } from '~/api/score'
import ScoreEditor from '~/components/modal/ScoreEditor.vue'
import * as popup from '~/utils/popup'

jest.mock('@ddradar/core')
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
  const chartScore: Api.ScoreInfo = {
    userId: 'user',
    userName: 'User',
    songId: testSongData.id,
    songName: testSongData.name,
    playStyle: propsData.playStyle,
    difficulty: propsData.difficulty,
    level: testSongData.charts[0].level,
    clearLamp: 2,
    rank: 'AAA',
    score: 990000,
  }
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  const $parent = { close: jest.fn() }
  beforeEach(() => {
    mocked(getChartScore).mockResolvedValue([chartScore])
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
    beforeEach(() => mocked(Score.getDanceLevel).mockClear())
    test('{ isFailed: true } returns "E"', () => {
      // Arrange - Act
      wrapper.setData({ isFailed: true })
      // @ts-ignore
      const rank = wrapper.vm.rank

      // Assert
      expect(rank).toBe('E')
      expect(mocked(Score.getDanceLevel)).not.toBeCalled()
    })
    test('{ isFailed: false } returns getDanceLevel()', () => {
      // Arrange
      const score = 800000
      mocked(Score.getDanceLevel).mockClear()
      mocked(Score.getDanceLevel).mockReturnValue('A')

      // Act
      wrapper.setData({ isFailed: false, score })
      // @ts-ignore
      const rank = wrapper.vm.rank

      // Assert
      expect(rank).toBe('A')
      expect(mocked(Score.getDanceLevel)).toBeCalledWith(score)
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
    beforeEach(() => {
      mocked(Score.setValidScoreFromChart).mockReset()
      mocked(popup.warning).mockClear()
    })

    test('calls setValidScoreFromChart()', () => {
      // Arrange
      mocked(Score.setValidScoreFromChart).mockReturnValue({
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
      expect(mocked(Score.setValidScoreFromChart)).toBeCalled()
    })
    test('calls popup.warning() if setValidScoreFromChart() throws error', () => {
      // Arrange
      mocked(Score.setValidScoreFromChart).mockImplementation(() => {
        throw new Error('Invalid Score')
      })

      // Act
      // @ts-ignore
      wrapper.vm.calcScore()

      // Assert
      expect(mocked(Score.setValidScoreFromChart)).toBeCalled()
      expect(mocked(popup.warning)).toBeCalled()
    })
  })
  describe('saveScore', () => {
    beforeEach(() => {
      mocked(postChartScore).mockClear()
      mocked(popup.success).mockClear()
      mocked(popup.danger).mockClear()
      $parent.close.mockClear()
      // @ts-ignore
      wrapper.vm.$parent = $parent
    })
    test('calls postChartScore() and close', async () => {
      // Arrange - Act
      // @ts-ignore
      await wrapper.vm.saveScore()

      // Assert
      expect(mocked(postChartScore)).toBeCalled()
      expect(mocked(popup.success)).toBeCalled()
      expect($parent.close).toBeCalled()
    })
    test('calls popup.danger() if postChartScore() throws error and close', async () => {
      // Arrange
      mocked(postChartScore).mockRejectedValueOnce('Error')

      // Act
      // @ts-ignore
      await wrapper.vm.saveScore()

      // Assert
      expect(mocked(postChartScore)).toBeCalled()
      expect(mocked(popup.success)).not.toBeCalled()
      expect(mocked(popup.danger)).toBeCalled()
      expect($parent.close).toBeCalled()
    })
  })
  describe('deleteScore()', () => {
    const $http = {}
    const mocks = { $buefy: { dialog: { confirm: jest.fn() } }, $http }
    let wrapper: Wrapper<ScoreEditor>
    beforeEach(() => {
      mocked(deleteChartScore).mockClear()
      mocked(popup.success).mockClear()
      mocked(popup.danger).mockClear()
      $parent.close.mockClear()
      wrapper = shallowMount(ScoreEditor, { localVue, propsData, i18n, mocks })
      // @ts-ignore
      wrapper.vm.$parent = $parent
    })
    test('calls $buefy.dialog.confirm()', async () => {
      // Arrange - Act
      // @ts-ignore
      wrapper.vm.deleteScore()
      const onConfirm = mocks.$buefy.dialog.confirm.mock.calls[0][0]
        .onConfirm as Function
      await onConfirm()

      // Assert
      expect(mocked(deleteChartScore)).toBeCalledWith(
        $http,
        propsData.songId,
        propsData.playStyle,
        propsData.difficulty
      )
      expect(mocked(popup.success)).toBeCalled()
      expect(mocked(popup.danger)).not.toBeCalled()
      expect($parent.close).toBeCalled()
    })
    test('calls popup.danger() if deleteChartScore() throws error', async () => {
      // Arrange
      mocked(deleteChartScore).mockRejectedValueOnce('Error')

      // Act
      // @ts-ignore
      wrapper.vm.deleteScore()
      const onConfirm = mocks.$buefy.dialog.confirm.mock.calls[0][0]
        .onConfirm as Function
      await onConfirm()

      // Assert
      expect(mocked(deleteChartScore)).toBeCalledWith(
        $http,
        propsData.songId,
        propsData.playStyle,
        propsData.difficulty
      )
      expect(mocked(popup.success)).not.toBeCalled()
      expect(mocked(popup.danger)).toBeCalled()
      expect($parent.close).toBeCalled()
    })
  })
  describe('fetchScore', () => {
    const data = {
      score: 0,
      exScore: 0,
      clearLamp: 0,
      maxCombo: 0,
      isFailed: false,
    }
    beforeEach(() => {
      mocked(getChartScore).mockClear()
      mocked(popup.danger).mockClear()
      wrapper.setData(data)
    })
    test.each([
      [
        data,
        chartScore,
        { ...data, score: 990000, clearLamp: 2, isFailed: false },
      ],
      [
        {},
        { ...chartScore, exScore: 300, maxCombo: 120 },
        {
          score: 990000,
          clearLamp: 2,
          isFailed: false,
          exScore: 300,
          maxCombo: 120,
        },
      ],
      [
        { score: 0, clearLamp: 6, isFailed: true, exScore: 300, maxCombo: 120 },
        chartScore,
        {
          score: 990000,
          clearLamp: 2,
          isFailed: false,
          exScore: 300,
          maxCombo: 120,
        },
      ],
    ])(
      '(data: %p, getChartScore(): %p) sets %p',
      async (data, score, expected) => {
        // Arrange
        mocked(getChartScore).mockResolvedValueOnce([score])
        wrapper.setData(data)

        // Act
        // @ts-ignore
        await wrapper.vm.fetchScore()

        // Assert
        expect(wrapper.vm.$data.score).toBe(expected.score)
        expect(wrapper.vm.$data.exScore).toBe(expected.exScore)
        expect(wrapper.vm.$data.clearLamp).toBe(expected.clearLamp)
        expect(wrapper.vm.$data.maxCombo).toBe(expected.maxCombo)
        expect(wrapper.vm.$data.isFailed).toBe(expected.isFailed)

        expect(mocked(getChartScore)).toBeCalled()
        expect(mocked(popup.danger)).not.toBeCalled()
      }
    )
    test('calls popup.danger() if getChartScore() throws error', async () => {
      // Arrange
      mocked(getChartScore).mockRejectedValueOnce('Error')

      // Act
      // @ts-ignore
      await wrapper.vm.fetchScore()

      // Assert
      expect(wrapper.vm.$data.score).toBe(0)
      expect(wrapper.vm.$data.exScore).toBe(0)
      expect(wrapper.vm.$data.clearLamp).toBe(0)
      expect(wrapper.vm.$data.maxCombo).toBe(0)
      expect(wrapper.vm.$data.isFailed).toBe(false)

      expect(mocked(getChartScore)).toBeCalled()
      expect(mocked(popup.danger)).toBeCalled()
    })
    test('does not call popup.danger() if getChartScore() throws 404', async () => {
      // Arrange
      mocked(getChartScore).mockRejectedValueOnce('404')

      // Act
      // @ts-ignore
      await wrapper.vm.fetchScore()

      // Assert
      expect(wrapper.vm.$data.score).toBe(0)
      expect(wrapper.vm.$data.exScore).toBe(0)
      expect(wrapper.vm.$data.clearLamp).toBe(0)
      expect(wrapper.vm.$data.maxCombo).toBe(0)
      expect(wrapper.vm.$data.isFailed).toBe(false)

      expect(mocked(getChartScore)).toBeCalled()
      expect(mocked(popup.danger)).not.toBeCalled()
    })
  })
})
