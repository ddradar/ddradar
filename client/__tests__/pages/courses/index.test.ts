import { createLocalVue, shallowMount } from '@vue/test-utils'
import { mocked } from 'ts-jest/utils'

import { getCourseList } from '~/api/course'
import CourseListPage from '~/pages/courses/index.vue'

jest.mock('~/api/course')
const localVue = createLocalVue()

describe('pages/courses/index.vue', () => {
  const $fetchState = { pending: false }
  describe('fetch()', () => {
    const apiMock = mocked(getCourseList)
    beforeEach(() => {
      apiMock.mockClear()
      apiMock.mockResolvedValue([])
    })
    test.each([
      [{}, undefined, undefined],
      [{ series: '16' }, 16, undefined],
      [{ type: '1' }, undefined, 1],
      [{ series: '16', type: '1' }, 16, 1],
      [{ series: '17', type: '2' }, 17, 2],
    ])('%p calls getCourseList($http, %i, %i)', async (query, series, type) => {
      // Arrange
      const $route = { query }
      const $http = { $get: jest.fn() }
      const wrapper = shallowMount(CourseListPage, {
        mocks: { $fetchState, $http, $route },
        data: () => ({ courses: [] }),
      })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(apiMock).toBeCalledTimes(1)
      expect(apiMock).toBeCalledWith($http, series, type)
    })
  })
  describe('get title()', () => {
    test.each([
      [{}, ''],
      [{ series: '16' }, 'DanceDanceRevolution A20'],
      [{ series: '17' }, 'DanceDanceRevolution A20 PLUS'],
      [{ series: '16', type: '1' }, 'DanceDanceRevolution A20 - 段位認定'],
      [{ series: '17', type: '2' }, 'DanceDanceRevolution A20 PLUS - NONSTOP'],
    ])('%p returns "%s"', (query, expected) => {
      // Arrange
      const $route = { query }
      const wrapper = shallowMount(CourseListPage, {
        localVue,
        mocks: { $fetchState, $route },
        data: () => ({ courses: [] }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.title).toBe(expected)
    })
  })
})
