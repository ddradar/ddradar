import { Gate, Song } from '@ddradar/core'
import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'
import VueI18n from 'vue-i18n'

import { postSongScores } from '~/api/score'
import ScoreImporter from '~/components/modal/ScoreImporter.vue'
import * as popup from '~/utils/popup'

jest.mock('@ddradar/core')
jest.mock('~/api/score')
jest.mock('~/utils/popup')
const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/modal/ScoreImporter.vue', () => {
  const songId = '8Il6980di8P89lil1PDIqqIbiq1QO8lQ'
  const propsData = { songId, playStyle: 1, difficulty: 1, isCourse: false }
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })

  describe('snapshot test', () => {
    test.each(['ja', 'en'])(
      '{ locale: %s, sourceCode: "foo" } renders normal button',
      locale => {
        const wrapper = mount(ScoreImporter, {
          localVue,
          propsData,
          data: () => ({ sourceCode: 'foo', loading: false }),
          i18n: new VueI18n({ locale, silentFallbackWarn: true }),
        })
        expect(wrapper).toMatchSnapshot()
      }
    )
    test('{ sourceCode: null } renders disabled button', () => {
      const wrapper = mount(ScoreImporter, {
        localVue,
        propsData,
        data: () => ({ sourceCode: null, loading: false }),
        i18n,
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: true } renders loading button', () => {
      const wrapper = mount(ScoreImporter, {
        localVue,
        propsData,
        data: () => ({ sourceCode: 'foo', loading: true }),
        i18n,
      })
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Computed
  describe('get musicDetailUri()', () => {
    test.each([
      [false, 1, 0, false, 'ddra3', 'music_detail', 0],
      [true, 1, 1, false, 'ddra20', 'music_detail', 1],
      [false, 1, 2, true, 'ddra3', 'course_detail', 2],
      [false, 1, 3, false, 'ddra3', 'music_detail', 3],
      [false, 1, 4, false, 'ddra3', 'music_detail', 4],
      [true, 2, 1, true, 'ddra20', 'course_detail', 5],
      [false, 2, 2, false, 'ddra3', 'music_detail', 6],
      [false, 2, 3, false, 'ddra3', 'music_detail', 7],
      [false, 2, 4, false, 'ddra3', 'music_detail', 8],
    ])(
      `isDeletedOnGate(songId) = %p, { playStyle: %i, difficulty: %i, isCourse: %p } returns "https://p.eagate.573.jp/game/ddr/%s/p/playdata/%s.html?index=${songId}&diff=%i"`,
      (isDeleted, playStyle, difficulty, isCourse, series, file, diff) => {
        // Arrange
        jest.mocked(Song.isDeletedOnGate).mockReturnValueOnce(isDeleted)
        const wrapper = shallowMount(ScoreImporter, {
          localVue,
          propsData: { songId, playStyle, difficulty, isCourse },
          i18n,
        })

        // Act
        // @ts-ignore
        const uri = wrapper.vm.musicDetailUri

        // Assert
        expect(uri).toBe(
          `https://p.eagate.573.jp/game/ddr/${series}/p/playdata/${file}.html?index=${songId}&diff=${diff}`
        )
      }
    )
  })

  // Method
  describe('importScore()', () => {
    const score: ReturnType<typeof Gate.musicDetailToScore> = {
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
    const postMock = jest.mocked(postSongScores)
    beforeEach(() => {
      postMock.mockClear()
      wrapper = shallowMount(ScoreImporter, {
        localVue,
        mocks: { $http, $buefy },
        propsData,
        i18n,
      })
    })

    test('does not call "Post Song Scores" API', async () => {
      // Arrange - Act
      // @ts-ignore
      await wrapper.vm.importScore()

      // Assert
      expect(jest.mocked(Gate.musicDetailToScore)).not.toBeCalled()
      expect(postMock).not.toBeCalled()
    })
    test('calls "Post Song Scores" API', async () => {
      // Arrange
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      const convertMock = jest.mocked(Gate.musicDetailToScore)
      convertMock.mockReturnValue(score)
      // @ts-ignore
      wrapper.vm.$parent.close = jest.fn()

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
      const warningMock = jest.mocked(popup.warning)
      const convertMock = jest.mocked(Gate.musicDetailToScore)
      const error = new Error('invalid')
      convertMock.mockImplementation(() => {
        throw error
      })

      // Act
      // @ts-ignore
      await wrapper.vm.importScore()

      // Assert
      expect(postMock).not.toBeCalled()
      expect(warningMock).lastCalledWith($buefy, error)
    })
    test('shows error message if API returns ErrorCode', async () => {
      // Arrange
      const errorMessage = '500 Server Error'
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      const dangerMock = jest.mocked(popup.danger)
      const convertMock = jest.mocked(Gate.musicDetailToScore)
      convertMock.mockReturnValue(score)
      const error = new Error(errorMessage)
      postMock.mockRejectedValue(error)

      // Act
      // @ts-ignore
      await wrapper.vm.importScore()

      // Assert
      expect(dangerMock).lastCalledWith($buefy, error)
    })
  })
})
