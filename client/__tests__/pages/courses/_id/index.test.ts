import { testCourseData } from '@ddradar/core/__tests__/data'
import { ref } from '@nuxtjs/composition-api'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { mocked } from 'ts-jest/utils'

import { useCourseInfo } from '~/composables/useCourseApi'
import CourseDetailPage from '~/pages/courses/_id/index.vue'

jest.mock('~/composables/useCourseApi')
const localVue = createLocalVue()

describe('pages/courses/_id/index.vue', () => {
  const course = { ...testCourseData }
  const mocks = { $route: { params: { id: course.id } } }
  beforeAll(() =>
    mocked(useCourseInfo).mockReturnValue({ course: ref(course) } as any)
  )

  describe('snapshot test', () => {
    test('renders correctly', () => {
      // Arrange - Act
      const data = () => ({ course })
      const wrapper = shallowMount(CourseDetailPage, { localVue, data, mocks })

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Lifecycle
  describe('validate()', () => {
    test.each(['', 'foo', '99', '-1', '000000000000000000000000000000000'])(
      '/courses/%s returns false',
      id => {
        // Arrange
        const wrapper = shallowMount(CourseDetailPage, { localVue, mocks })
        const ctx = { params: { id } } as any

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
      }
    )
    test.each(['00000000000000000000000000000000', course.id])(
      '/courses/%s returns true',
      id => {
        // Arrange
        const wrapper = shallowMount(CourseDetailPage, { localVue, mocks })
        const ctx = { params: { id } } as any

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
      }
    )
  })
  describe('setup()', () => {
    beforeEach(() => mocked(useCourseInfo).mockClear())
    test('calls useCourseInfo(params.id)', async () => {
      // Arrange - Act
      const wrapper = shallowMount(CourseDetailPage, { localVue, mocks })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.$data.course).toBe(course)
      expect(mocked(useCourseInfo)).toBeCalledTimes(1)
      expect(mocked(useCourseInfo)).toBeCalledWith(course.id)
    })
  })
})
