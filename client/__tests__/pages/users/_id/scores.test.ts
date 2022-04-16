import { publicUser, testScores } from '@ddradar/core/__tests__/data'
import type { Context } from '@nuxt/types'
import { mount, shallowMount } from '@vue/test-utils'

import { createI18n, createVue } from '~/__tests__/util'
import { getUserScores } from '~/api/score'
import { getUserInfo } from '~/api/user'
import ScorePage from '~/pages/users/_id/scores.vue'

jest.mock('~/api/score')
jest.mock('~/api/user')

const localVue = createVue()

describe('/users/_id/scores.vue', () => {
  const i18n = createI18n()
  const stubs = { ScoreList: true }
  const $http = {}

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n(locale)

    test('renders correctly', () => {
      const data = () => ({ user: publicUser })
      const wrapper = mount(ScorePage, { data, i18n, localVue, stubs })
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Lifecycle
  describe('validate', () => {
    const wrapper = shallowMount(ScorePage, { localVue, i18n, stubs })

    test.each(['', '@', 'あああ'])('({ id: "%s" }) returns false', id => {
      // Arrange
      const ctx = { params: { id } } as unknown as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
    })
    test.each(['-_-', 'FOO', 'foo', '000'])(
      '({ id: "%s" }) returns true',
      id => {
        // Arrange
        const ctx = { params: { id } } as unknown as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
      }
    )
  })
  describe('fetch()', () => {
    const mocks = { $http, $route: { params: { id: 'foo' } } }
    const wrapper = shallowMount(ScorePage, { localVue, i18n, stubs, mocks })
    beforeEach(() => jest.mocked(getUserInfo).mockClear())

    test('/_id calls getUserInfo(this.$http, _id)', async () => {
      // Arrange
      jest.mocked(getUserInfo).mockResolvedValue(publicUser)

      // Act
      await wrapper.vm.$options.fetch!.call(wrapper.vm, null!)

      // Assert
      expect(jest.mocked(getUserInfo)).toBeCalledWith(
        $http,
        mocks.$route.params.id
      )
      expect(wrapper.vm.$data.user).toBe(publicUser)
    })
    test('sets user null if cause error', async () => {
      // Arrange
      jest.mocked(getUserInfo).mockRejectedValue('error')

      // Act
      await wrapper.vm.$options.fetch!.call(wrapper.vm, null!)

      // Assert
      expect(jest.mocked(getUserInfo)).toBeCalledWith(
        $http,
        mocks.$route.params.id
      )
      expect(wrapper.vm.$data.user).toBeNull()
    })
  })

  // Method
  describe('search()', () => {
    const mocks = { $http }
    const wrapper = shallowMount(ScorePage, { localVue, i18n, stubs, mocks })
    const scores = [{ ...testScores[0], isCourse: false }]
    beforeEach(() => jest.mocked(getUserScores).mockClear())

    test.each([
      [{}, undefined, undefined, undefined, undefined, undefined],
      [
        { playStyle: 1, difficulty: 0, level: 3, clearLamp: 6, rank: 'AAA' },
        1,
        0,
        3,
        6,
        'AAA',
      ],
    ])(
      `%p calls getUserScores($http, ${publicUser.id}, %p, %p, %p, %p, %p)`,
      async (data, playStyle, difficulty, level, clearLamp, rank) => {
        // Arrange
        jest.mocked(getUserScores).mockResolvedValue(scores)
        wrapper.setData({ user: publicUser, ...data })

        // Act
        // @ts-ignore
        await wrapper.vm.search()

        // Assert
        expect(wrapper.vm.$data.scores).toBe(scores)
        expect(jest.mocked(getUserScores)).toBeCalledWith(
          $http,
          publicUser.id,
          playStyle,
          difficulty,
          level,
          clearLamp,
          rank
        )
      }
    )
    test('sets scores [] if getUserScores() throws error', async () => {
      // Arrange
      jest.mocked(getUserScores).mockRejectedValue('error')
      wrapper.setData({ user: publicUser, scores })

      // Act
      // @ts-ignore
      await wrapper.vm.search()

      // Assert
      expect(wrapper.vm.$data.scores).toHaveLength(0)
      expect(jest.mocked(getUserScores)).toBeCalled()
    })
  })
})
