import { testCourseData } from '@ddradar/core/__tests__/data'
import { shallowMount } from '@vue/test-utils'

import { useCourseInfo, useCourseList } from '~/composables/useCourseApi'

import { createMockComponent } from './utils'

describe('/composables/useCourseApi.ts', () => {
  const course = { ...testCourseData }
  const $http = { $get: jest.fn<Promise<any>, [string, any]>() }
  const mocks = { $nuxt: { context: { $http } } }
  beforeEach(() => $http.$get.mockReset())

  describe('useCourseList', () => {
    test.each([
      [undefined, undefined, ''] as const,
      [undefined, 1, 'type=1'] as const,
      [undefined, 2, 'type=2'] as const,
      [16, undefined, 'series=16'] as const,
      [17, undefined, 'series=17'] as const,
      [16, 1, 'series=16&type=1'] as const,
      [16, 2, 'series=16&type=2'] as const,
      [17, 1, 'series=17&type=1'] as const,
      [17, 2, 'series=17&type=2'] as const,
    ])('(%i, %i) calls /api/v1/courses?%s', async (series, type, query) => {
      // Arrange
      $http.$get.mockResolvedValue([course])

      // Act
      const component = createMockComponent(() => useCourseList(series, type))
      const wrapper = shallowMount(component, { mocks })
      // @ts-ignore
      await wrapper.vm.fetch()

      // Assert
      expect(wrapper.vm.$data.courses).toStrictEqual([course])
      expect($http.$get.mock.calls[0][0]).toBe('/api/v1/courses')
      expect($http.$get.mock.calls[0][1].searchParams.toString()).toBe(query)
    })
  })

  describe('useCourseInfo', () => {
    test(`("${course.id}") calls GET "/api/v1/courses/${course.id}"`, async () => {
      // Arrange
      $http.$get.mockResolvedValue(course)

      // Act
      const component = createMockComponent(() => useCourseInfo(course.id))
      const wrapper = shallowMount(component, { mocks })
      // @ts-ignore
      await wrapper.vm.fetch()

      // Assert
      expect(wrapper.vm.$data.course).toBe(course)
      expect($http.$get).toBeCalledWith(`/api/v1/courses/${course.id}`)
    })
  })
})
