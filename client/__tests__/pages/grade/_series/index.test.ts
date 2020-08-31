import { createLocalVue, shallowMount } from '@vue/test-utils'
import { mocked } from 'ts-jest/utils'

import { getCourseList } from '~/api/course'
import GradeListPage from '~/pages/grade/_series/index.vue'

jest.mock('~/api/course')
const localVue = createLocalVue()

describe('pages/grade/_series/index.vue', () => {
  const $fetchState = { pending: false }
  describe('fetch()', () => {
    const apiMock = mocked(getCourseList)
    beforeEach(() => {
      apiMock.mockClear()
      apiMock.mockResolvedValue([])
    })
    test.each([
      ['16', 16],
      ['17', 17],
    ])('/%s calls getCourseList($http, %i, 2)', async (series, expected) => {
      // Arrange
      const $route = { params: { series } }
      const $http = { $get: jest.fn() }
      const wrapper = shallowMount(GradeListPage, {
        mocks: { $fetchState, $http, $route },
        data: () => ({ courses: [] }),
      })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(apiMock).toBeCalledTimes(1)
      expect(apiMock).toBeCalledWith($http, expected, 2)
    })
  })
  describe('get seriesTitle()', () => {
    test.each([
      ['16', 'DanceDanceRevolution A20'],
      ['17', 'DanceDanceRevolution A20 PLUS'],
    ])('/%s returns "%s"', (series, expected) => {
      // Arrange
      const $route = { params: { series } }
      const wrapper = shallowMount(GradeListPage, {
        localVue,
        mocks: { $fetchState, $route },
        data: () => ({ courses: [] }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.seriesTitle).toBe(expected)
    })
  })
})
