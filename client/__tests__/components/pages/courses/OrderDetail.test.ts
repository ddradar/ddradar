import { testCourseData } from '@ddradar/core/__tests__/data'
import { mount, RouterLinkStub } from '@vue/test-utils'

import { createVue } from '~/__tests__/util'
import OrderDetail from '~/components/pages/courses/OrderDetail.vue'

const localVue = createVue()

describe('/components/pages/courses/OrderDetail.vue', () => {
  const course = { ...testCourseData }
  const chart = { ...testCourseData.charts[0] }
  const propsData = { course, chart }
  const stubs = { NuxtLink: RouterLinkStub, ScoreBoard: true }

  describe('snapshot test', () => {
    test('renders correctly', () => {
      // Arrange - Act
      const wrapper = mount(OrderDetail, { localVue, propsData, stubs })

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })
})
