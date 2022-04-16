import type { Api, Database } from '@ddradar/core'
import {
  testCourseData,
  testScores,
  testSongData,
} from '@ddradar/core/__tests__/data'
import { mount, RouterLinkStub, shallowMount } from '@vue/test-utils'

import { createI18n, createVue } from '~/__tests__/util'
import { getCourseInfo } from '~/api/course'
import { getSongInfo } from '~/api/song'
import ScoreList from '~/components/pages/users/ScoreList.vue'

jest.mock('~/api/course')
jest.mock('~/api/song')

const localVue = createVue()

const score: Api.ScoreList & Partial<Database.ScoreSchema> = {
  ...testScores[0],
  isCourse: false,
}
delete score.userId
delete score.userName
delete score.isPublic

describe('/components/pages/users/ScoreList.vue', () => {
  const $accessor = { isLoggedIn: false }

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const scores: Api.ScoreList[] = [
      score,
      { ...score, playStyle: 2, difficulty: 1 },
      { ...score, isCourse: true },
    ]
    const mocks = { $accessor }
    const i18n = createI18n(locale)
    const stubs = { NuxtLink: RouterLinkStub, ScoreBadge: true }
    const wrapper = mount(ScoreList, { localVue, stubs, i18n, mocks })

    test('{ loading: true } renders loading spin', async () => {
      // Arrange
      wrapper.setProps({ loading: true })
      await wrapper.vm.$nextTick()

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [...] } renders score list', async () => {
      // Arrange
      wrapper.setProps({ loading: false, scores })
      await wrapper.vm.$nextTick()

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [] } renders empty', async () => {
      // Arrange
      wrapper.setProps({ loading: false, charts: [] })
      await wrapper.vm.$nextTick()

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ isLoggedIn : true } renders "Edit" button', async () => {
      // Arrange
      const mocks = { $accessor: { isLoggedIn: true } }
      const wrapper = mount(ScoreList, { localVue, stubs, i18n, mocks })
      wrapper.setProps({ loading: false, scores })
      await wrapper.vm.$nextTick()

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Method
  describe('scoreEditorModal', () => {
    const mocks = {
      $accessor,
      $buefy: { modal: { open: jest.fn() } },
      $http: {},
    }
    beforeAll(() => {
      jest.mocked(getSongInfo).mockResolvedValue(testSongData)
      jest.mocked(getCourseInfo).mockResolvedValue(testCourseData)
    })
    beforeEach(() => {
      mocks.$buefy.modal.open.mockClear()
      jest.mocked(getSongInfo).mockClear()
      jest.mocked(getCourseInfo).mockClear()
    })

    test('(isCourse: false) calls getSongInfo()', async () => {
      // Arrange
      const i18n = createI18n()
      const wrapper = shallowMount(ScoreList, { localVue, mocks, i18n })

      // Act
      // @ts-ignore
      await wrapper.vm.scoreEditorModal(
        testSongData.id,
        testSongData.charts[0].playStyle,
        testSongData.charts[0].difficulty,
        false
      )

      // Assert
      expect(jest.mocked(getSongInfo)).toBeCalledWith(
        mocks.$http,
        testSongData.id
      )
      expect(jest.mocked(getCourseInfo)).not.toBeCalled()
      expect(mocks.$buefy.modal.open).toBeCalled()
    })

    test('(isCourse: true) calls getCourseInfo()', async () => {
      // Arrange
      const i18n = createI18n()
      const wrapper = shallowMount(ScoreList, { localVue, mocks, i18n })

      // Act
      // @ts-ignore
      await wrapper.vm.scoreEditorModal(
        testCourseData.id,
        testCourseData.charts[0].playStyle,
        testCourseData.charts[0].difficulty,
        true
      )

      // Assert
      expect(jest.mocked(getSongInfo)).not.toBeCalled()
      expect(jest.mocked(getCourseInfo)).toBeCalledWith(
        mocks.$http,
        testCourseData.id
      )
      expect(mocks.$buefy.modal.open).toBeCalled()
    })
  })
})
