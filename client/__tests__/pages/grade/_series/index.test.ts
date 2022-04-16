import type { Context } from '@nuxt/types'
import { mount, RouterLinkStub, shallowMount } from '@vue/test-utils'

import { createI18n, createVue } from '~/__tests__/util'
import { getCourseList } from '~/api/course'
import GradeListPage from '~/pages/grade/_series/index.vue'

jest.mock('~/api/course')

const localVue = createVue()

describe('pages/grade/_series/index.vue', () => {
  const $fetchState = { pending: false }
  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n(locale)
    test('renders correctly', () => {
      // Arrange
      const $route = { params: { series: '16' }, path: '/grade/16' }
      const mocks = { $fetchState, $route }
      const stubs = { NuxtLink: RouterLinkStub, CourseList: true }
      const wrapper = mount(GradeListPage, { localVue, mocks, stubs, i18n })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Lifecycle
  describe('validate()', () => {
    const i18n = createI18n()
    test.each(['', 'foo', '100', '-1'])('/%s returns false', series => {
      // Arrange
      const mocks = { $fetchState, $route: { params: { series } } }
      const wrapper = shallowMount(GradeListPage, { localVue, mocks, i18n })
      const ctx = { ...mocks.$route } as unknown as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
    })
    test.each(['16', '17'])('/%s returns true', series => {
      // Arrange
      const mocks = { $fetchState, $route: { params: { series } } }
      const wrapper = shallowMount(GradeListPage, { localVue, mocks, i18n })
      const ctx = { ...mocks.$route } as unknown as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
    })
  })
  describe('fetch()', () => {
    const i18n = createI18n()
    const apiMock = jest.mocked(getCourseList)
    beforeEach(() => {
      apiMock.mockClear()
      apiMock.mockResolvedValue([])
    })
    test.each([
      ['16', 16],
      ['17', 17],
    ])('/%s calls getCourseList($http, %i, 2)', async (series, expected) => {
      // Arrange
      const $route = { params: { series }, path: `/grade/${series}` }
      const mocks = { $fetchState, $http: { $get: jest.fn() }, $route }
      const wrapper = shallowMount(GradeListPage, { localVue, mocks, i18n })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(apiMock).toBeCalledTimes(1)
      expect(apiMock).toBeCalledWith(mocks.$http, expected, 2)
    })
  })

  // Computed
  describe('get title()', () => {
    test.each([
      ['16', 'ja', 'DanceDanceRevolution A20 - 段位認定'],
      ['17', 'ja', 'DanceDanceRevolution A20 PLUS - 段位認定'],
      ['16', 'en', 'DanceDanceRevolution A20 - GRADE'],
      ['17', 'en', 'DanceDanceRevolution A20 PLUS - GRADE'],
    ])('/%s (locale:%s) returns "%s"', (series, locale, expected) => {
      const i18n = createI18n(locale)
      // Arrange
      const $route = { params: { series }, path: `/grade/${series}` }
      const mocks = { $fetchState, $route }
      const wrapper = shallowMount(GradeListPage, { localVue, mocks, i18n })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.title).toBe(expected)
    })
  })
})
