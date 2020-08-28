import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import { postSongScores } from '~/api/score'
import ScoreImporter from '~/components/modal/ScoreImporter.vue'
import { musicDetailToScore } from '~/utils/eagate-parser'
import * as popup from '~/utils/popup'

jest.mock('~/api/score')
jest.mock('~/utils/eagate-parser')
jest.mock('~/utils/popup')
const localVue = createLocalVue()
localVue.use(Buefy)

describe('/components/modal/ScoreImporter.vue', () => {
  const songId = '8Il6980di8P89lil1PDIqqIbiq1QO8lQ'
  const propsData = { songId, playStyle: 1, difficulty: 1, isCourse: false }
  describe('snapshot test', () => {
    test('{ sourceCode: "foo" } renders normal button', () => {
      const wrapper = mount(ScoreImporter, {
        localVue,
        propsData,
        data: () => ({ sourceCode: 'foo', loading: false }),
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('{ sourceCode: null } renders disabled button', () => {
      const wrapper = mount(ScoreImporter, {
        localVue,
        propsData,
        data: () => ({ sourceCode: null, loading: false }),
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: true } renders loading button', () => {
      const wrapper = mount(ScoreImporter, {
        localVue,
        propsData,
        data: () => ({ sourceCode: 'foo', loading: true }),
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('get musicDetailUri()', () => {
    test.each([
      [1, 0, false, /^.+\/music_detail\.html\?index=.{32}&diff=0$/],
      [1, 1, false, /^.+\/music_detail\.html\?index=.{32}&diff=1$/],
      [1, 2, false, /^.+\/music_detail\.html\?index=.{32}&diff=2$/],
      [1, 3, false, /^.+\/music_detail\.html\?index=.{32}&diff=3$/],
      [1, 4, false, /^.+\/music_detail\.html\?index=.{32}&diff=4$/],
      [2, 1, false, /^.+\/music_detail\.html\?index=.{32}&diff=5$/],
      [2, 2, false, /^.+\/music_detail\.html\?index=.{32}&diff=6$/],
      [2, 3, false, /^.+\/music_detail\.html\?index=.{32}&diff=7$/],
      [2, 4, false, /^.+\/music_detail\.html\?index=.{32}&diff=8$/],
      [1, 0, true, /^.+\/course_detail\.html\?index=.{32}&diff=0$/],
      [1, 1, true, /^.+\/course_detail\.html\?index=.{32}&diff=1$/],
      [1, 2, true, /^.+\/course_detail\.html\?index=.{32}&diff=2$/],
      [1, 3, true, /^.+\/course_detail\.html\?index=.{32}&diff=3$/],
      [1, 4, true, /^.+\/course_detail\.html\?index=.{32}&diff=4$/],
      [2, 1, true, /^.+\/course_detail\.html\?index=.{32}&diff=5$/],
      [2, 2, true, /^.+\/course_detail\.html\?index=.{32}&diff=6$/],
      [2, 3, true, /^.+\/course_detail\.html\?index=.{32}&diff=7$/],
      [2, 4, true, /^.+\/course_detail\.html\?index=.{32}&diff=8$/],
    ])(
      '{ playStyle: %i, difficulty: %i, isCourse: %p } returns "%s"',
      (playStyle, difficulty, isCourse, pattern) => {
        // Arrange
        const wrapper = shallowMount(ScoreImporter, {
          localVue,
          propsData: { songId, playStyle, difficulty, isCourse },
        })

        // Act
        // @ts-ignore
        const uri = wrapper.vm.musicDetailUri

        // Assert
        expect(uri).toMatch(pattern)
      }
    )
  })
  describe('importScore()', () => {
    const score: ReturnType<typeof musicDetailToScore> = {
      songId: 'ld6P1lbb0bPO9doqbbPOoPb8qoDo8id0',
      playStyle: 1,
      difficulty: 0,
      score: 1000000,
      rank: 'AAA',
      clearLamp: 7,
      maxCombo: 116,
      topScore: 1000000,
    }
    let wrapper: Wrapper<ScoreImporter>
    const $http = { $post: jest.fn() }
    const $buefy = { notification: {} }
    const postMock = mocked(postSongScores)
    beforeEach(() => {
      postMock.mockClear()
      wrapper = shallowMount(ScoreImporter, {
        localVue,
        mocks: { $http, $buefy },
        propsData,
      })
    })
    test('calls "Post Song Scores" API', async () => {
      // Arrange
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      const convertMock = mocked(musicDetailToScore)
      convertMock.mockReturnValue(score)

      // Act
      // @ts-ignore
      await wrapper.vm.importScore()

      // Assert
      expect(postMock).lastCalledWith($http, songId, [score])
    })
    test('shows warning message if sourceCode is invalid', async () => {
      // Arrange
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      const warningMock = mocked(popup.warning)
      const convertMock = mocked(musicDetailToScore)
      convertMock.mockImplementation(() => {
        throw new Error('invalid')
      })

      // Act
      // @ts-ignore
      await wrapper.vm.importScore()

      // Assert
      expect(postMock).not.toBeCalled()
      expect(warningMock).lastCalledWith($buefy, 'HTMLソース文字列が不正です')
    })
    test('shows error message if API returns ErrorCode', async () => {
      // Arrange
      const errorMessage = '500 Server Error'
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      const dangerMock = mocked(popup.danger)
      const convertMock = mocked(musicDetailToScore)
      convertMock.mockReturnValue(score)
      postMock.mockRejectedValue(new Error(errorMessage))

      // Act
      // @ts-ignore
      await wrapper.vm.importScore()

      // Assert
      expect(dangerMock).lastCalledWith($buefy, errorMessage)
    })
  })
})
