import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import { postSongScores } from '~/api/score'
import ImportPage from '~/pages/import.vue'
import { musicDataToScoreList } from '~/utils/eagate-parser'
import * as popup from '~/utils/popup'

jest.mock('~/api/score')
jest.mock('~/utils/eagate-parser')
jest.mock('~/utils/popup')

const localVue = createLocalVue()
localVue.use(Buefy)

describe('pages/import.vue', () => {
  let wrapper: Wrapper<ImportPage>
  const $http = {
    $post: jest.fn(),
  }
  const $buefy = { notification: {} }
  beforeEach(() => {
    wrapper = shallowMount(ImportPage, { localVue, mocks: { $http, $buefy } })
  })

  describe('snapshot test', () => {
    test('renders correctly', () => {
      const wrapper = mount(ImportPage, {
        localVue,
        data: () => ({ sourceCode: '<html></html>' }),
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders uploading state', () => {
      const wrapper = mount(ImportPage, {
        localVue,
        data: () => ({
          sourceCode: '<html></html>',
          loading: true,
          maxCount: 20,
          doneCount: 7,
        }),
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('register button', () => {
    test('has no disabled attribute if sourceCode is valid', async () => {
      // Arrange - Act
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()

      // Assert
      const button = wrapper.find('b-button-stub')
      expect(button.attributes().disabled).toBeFalsy()
      expect(button.attributes().loading).toBeFalsy()
    })
    test('has disabled attribute if sourceCode is invalid', async () => {
      // Arrange - Act
      wrapper.setData({ sourceCode: '', loading: false })
      await wrapper.vm.$nextTick()

      // Assert
      const button = wrapper.find('b-button-stub')
      expect(button.attributes().disabled).toBeTruthy()
      expect(button.attributes().loading).toBeFalsy()
    })
    test('has loading attribute if loading state', async () => {
      // Arrange - Act
      wrapper.setData({ sourceCode: '', loading: true })
      await wrapper.vm.$nextTick()

      // Assert
      const button = wrapper.find('b-button-stub')
      expect(button.attributes().loading).toBeTruthy()
    })
  })
  describe('importEageteScores()', () => {
    const scoreList: ReturnType<typeof musicDataToScoreList> = {
      I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o: [
        {
          songId: 'I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o',
          songName: '朧',
          playStyle: 1,
          difficulty: 0,
          score: 876000,
          clearLamp: 2,
          rank: 'A+',
        },
        {
          songId: 'I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o',
          songName: '朧',
          playStyle: 1,
          difficulty: 2,
          score: 823000,
          clearLamp: 2,
          rank: 'A',
        },
        {
          songId: 'I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o',
          songName: '朧',
          playStyle: 1,
          difficulty: 3,
          score: 798000,
          clearLamp: 2,
          rank: 'A-',
        },
        {
          songId: 'I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o',
          songName: '朧',
          playStyle: 1,
          difficulty: 4,
          score: 780000,
          clearLamp: 2,
          rank: 'B+',
        },
      ],
    }
    const postMock = mocked(postSongScores)
    beforeEach(() => {
      postMock.mockClear()
    })

    test('calls "Post Song Scores" API', async () => {
      // Arrange
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      const convertMock = mocked(musicDataToScoreList)
      convertMock.mockReturnValue(scoreList)

      // Act
      // @ts-ignore
      await wrapper.vm.importEageteScores()

      // Assert
      expect(postMock).lastCalledWith(
        $http,
        'I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o',
        scoreList.I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o
      )
    })
    test('does not call "Post Song Scores" API if scores is empty', async () => {
      // Arrange
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      const convertMock = mocked(musicDataToScoreList)
      convertMock.mockReturnValue({ foo: [] })

      // Act
      // @ts-ignore
      await wrapper.vm.importEageteScores()

      // Assert
      expect(postMock).not.toBeCalled()
    })
    test('shows warning message if sourceCode is invalid', async () => {
      // Arrange
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      const warningMock = mocked(popup.warning)
      const convertMock = mocked(musicDataToScoreList)
      convertMock.mockImplementation(() => {
        throw new Error('invalid')
      })

      // Act
      // @ts-ignore
      await wrapper.vm.importEageteScores()

      // Assert
      expect(warningMock).lastCalledWith($buefy, 'HTMLソース文字列が不正です')
    })
    test('shows error message if API returns ErrorCode', async () => {
      // Arrange
      const errorMessage = '500 Server Error'
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      const dangerMock = mocked(popup.danger)
      const convertMock = mocked(musicDataToScoreList)
      convertMock.mockReturnValue(scoreList)
      postMock.mockRejectedValue(new Error(errorMessage))

      // Act
      // @ts-ignore
      await wrapper.vm.importEageteScores()

      // Assert
      expect(dangerMock).lastCalledWith($buefy, errorMessage)
    })
  })
})
