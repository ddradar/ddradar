import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { postSongScores } from '~/api/score'
import ImportPage from '~/pages/import.vue'
import { musicDataToScoreList } from '~/utils/eagate-parser'
import * as popup from '~/utils/popup'
import { scoreTexttoScoreList } from '~/utils/skill-attack'

jest.mock('~/api/score')
jest.mock('~/utils/eagate-parser')
jest.mock('~/utils/popup')
jest.mock('~/utils/skill-attack')

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('pages/import.vue', () => {
  let wrapper: Wrapper<ImportPage>
  const $accessor = { user: { code: 10000000 } }
  const $http = {}
  const $buefy = {}
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  beforeEach(() => {
    wrapper = shallowMount(ImportPage, {
      localVue,
      mocks: { $accessor, $http, $buefy },
      i18n,
    })
  })

  describe('snapshot test', () => {
    test.each(['ja', 'en'])('{ locale: "%s" } renders correctly', locale => {
      const i18n = new VueI18n({ locale, silentFallbackWarn: true })
      const wrapper = mount(ImportPage, {
        localVue,
        data: () => ({ sourceCode: '<html></html>' }),
        mocks: { $accessor },
        i18n,
      })
      expect(wrapper).toMatchSnapshot()
    })
    test.each(['ja', 'en'])(
      '{ locale: "%s" } renders uploading state',
      locale => {
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const wrapper = mount(ImportPage, {
          localVue,
          data: () => ({
            sourceCode: '<html></html>',
            loading: true,
            maxCount: 20,
            doneCount: 7,
            currentSong: 'PARANOiA',
          }),
          mocks: { $accessor },
          i18n,
        })
        expect(wrapper).toMatchSnapshot()
      }
    )
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
    const convertMock = mocked(musicDataToScoreList)
    const successMock = mocked(popup.success)
    const warningMock = mocked(popup.warning)
    const dangerMock = mocked(popup.danger)
    beforeEach(() => {
      postMock.mockClear()
      convertMock.mockClear()
      successMock.mockClear()
      warningMock.mockClear()
      dangerMock.mockClear()
    })

    test.each([
      ['ja', '1件のスコアを登録しました'],
      ['en', 'Uploaded: 1 song'],
    ])(
      '{ locale: "%s" } calls "Post Song Scores" API and popup.success($buefy, "%s")',
      async (locale, message) => {
        // Arrange
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const wrapper = shallowMount(ImportPage, {
          localVue,
          mocks: { $accessor, $http, $buefy },
          i18n,
          data: () => ({ sourceCode: '<html></html>', loading: false }),
        })
        convertMock.mockReturnValue(scoreList)

        // Act
        // @ts-ignore
        await wrapper.vm.importEageteScores()

        // Assert
        expect(postMock).toBeCalledWith(
          $http,
          'I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o',
          scoreList.I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o
        )
        expect(successMock).toBeCalledWith($buefy, message)
      }
    )
    test('does not call "Post Song Scores" API if scores is empty', async () => {
      // Arrange
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      convertMock.mockReturnValue({ foo: [] })

      // Act
      // @ts-ignore
      await wrapper.vm.importEageteScores()

      // Assert
      expect(postMock).not.toBeCalled()
    })
    test.each([
      ['ja', 'HTMLソース文字列が不正です'],
      ['en', 'Invalid HTML'],
    ])(
      '{ locale: "%s" } warns "%s" if sourceCode is invalid',
      async (locale, message) => {
        // Arrange
        convertMock.mockImplementation(() => {
          throw new Error('invalid')
        })
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const wrapper = shallowMount(ImportPage, {
          localVue,
          mocks: { $accessor, $http, $buefy },
          i18n,
          data: () => ({ sourceCode: '<html></html>', loading: false }),
        })

        // Act
        // @ts-ignore
        await wrapper.vm.importEageteScores()

        // Assert
        expect(warningMock).toBeCalledWith($buefy, message)
      }
    )
    test('shows error message if API returns ErrorCode', async () => {
      // Arrange
      const errorMessage = '500 Server Error'
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      convertMock.mockReturnValue(scoreList)
      postMock.mockRejectedValueOnce(new Error(errorMessage))

      // Act
      // @ts-ignore
      await wrapper.vm.importEageteScores()

      // Assert
      expect(dangerMock).toBeCalledWith($buefy, errorMessage)
    })
  })

  describe('importSkillAttackScores()', () => {
    const scoreList: ReturnType<typeof scoreTexttoScoreList> = {
      '691': [
        {
          songName: '朧',
          playStyle: 1,
          difficulty: 0,
          score: 876000,
          clearLamp: 2,
          rank: 'A+',
        },
        {
          songName: '朧',
          playStyle: 1,
          difficulty: 2,
          score: 823000,
          clearLamp: 2,
          rank: 'A',
        },
        {
          songName: '朧',
          playStyle: 1,
          difficulty: 3,
          score: 798000,
          clearLamp: 2,
          rank: 'A-',
        },
        {
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
    const convertMock = mocked(scoreTexttoScoreList)
    const warningMock = mocked(popup.warning)
    beforeEach(() => {
      postMock.mockClear()
      convertMock.mockClear()
      warningMock.mockClear()
    })

    test('calls "Post Song Scores" API', async () => {
      // Arrange
      const wrapper = shallowMount(ImportPage, {
        localVue,
        mocks: { $accessor, $http, $buefy },
        i18n,
        data: () => ({ file: {} }),
      })
      convertMock.mockReturnValue(scoreList)

      // Act
      // @ts-ignore
      await wrapper.vm.importSkillAttackScores()

      // Assert
      expect(postMock).toBeCalledWith($http, '691', scoreList['691'])
    })
    test('does not call scoreTexttoScoreList() if file is empty', async () => {
      // Arrange
      wrapper.setData({ file: null })
      await wrapper.vm.$nextTick()
      convertMock.mockReturnValue({ foo: [] })

      // Act
      // @ts-ignore
      await wrapper.vm.importSkillAttackScores()

      // Assert
      expect(convertMock).not.toBeCalled()
      expect(postMock).not.toBeCalled()
    })
    test('does not call "Post Song Scores" API if scores is empty', async () => {
      // Arrange
      wrapper.setData({ file: {} })
      await wrapper.vm.$nextTick()
      convertMock.mockReturnValue({ foo: [] })

      // Act
      // @ts-ignore
      await wrapper.vm.importSkillAttackScores()

      // Assert
      expect(convertMock).toBeCalled()
      expect(postMock).not.toBeCalled()
    })
    test.each([
      ['ja', 'ファイルが読み取れないか、正しい形式ではありません'],
      ['en', 'Cannot read file or invalid file'],
    ])(
      '{ locale: "%s" } warns "%s" if sourceCode is invalid',
      async (locale, message) => {
        // Arrange
        convertMock.mockImplementation(() => {
          throw new Error('invalid')
        })
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const wrapper = shallowMount(ImportPage, {
          localVue,
          mocks: { $accessor, $http, $buefy },
          i18n,
          data: () => ({ file: {} }),
        })

        // Act
        // @ts-ignore
        await wrapper.vm.importSkillAttackScores()

        // Assert
        expect(warningMock).toBeCalledWith($buefy, message)
      }
    )
  })
})
