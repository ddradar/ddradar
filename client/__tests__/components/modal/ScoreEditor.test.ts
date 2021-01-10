import { testSongData } from '@core/__tests__/data'
import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'
import VueI18n from 'vue-i18n'

import ScoreEditor from '~/components/modal/ScoreEditor.vue'

jest.mock('~/api/score')
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
    test('{ isFailed: true } returns "E"', () => {
      // Arrange - Act
      wrapper.setData({ isFailed: true })
      // @ts-ignore
      const rank = wrapper.vm.rank

      // Assert
      expect(rank).toBe('E')
    })
    test.each([
      [990000, 'AAA'],
      [950000, 'AA+'],
      [900000, 'AA'],
      [890000, 'AA-'],
      [850000, 'A+'],
      [800000, 'A'],
      [790000, 'A-'],
      [750000, 'B+'],
      [700000, 'B'],
      [690000, 'B-'],
      [650000, 'C+'],
      [600000, 'C'],
      [590000, 'C-'],
      [550000, 'D+'],
    ])('{ isFailed: false, score: %i } returns "%s"', (score, expected) => {
      // Arrange - Act
      wrapper.setData({ isFailed: false, score })
      // @ts-ignore
      const rank = wrapper.vm.rank

      // Assert
      expect(rank).toBe(expected)
    })
  })
})
