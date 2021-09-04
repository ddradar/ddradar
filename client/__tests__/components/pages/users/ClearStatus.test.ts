import type { Api, Score } from '@ddradar/core'
import { createLocalVue, mount } from '@vue/test-utils'
import Buefy from 'buefy'

import Component from '~/components/pages/users/ClearStatus.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('/components/pages/users/ClearStatus.vue', () => {
  describe('snapshot test', () => {
    test('({ statuses: [...] }) renders clearLamp list', async () => {
      // Arrange
      const statuses: Omit<Api.ClearStatus, 'playStyle'>[] = [
        ...Array(19 * 9).keys(),
      ].map(i => ({
        level: (i % 19) + 1,
        clearLamp: ((i % 9) - 1) as Score.ClearLamp | -1,
        count: (i % 9) * 10 + 10,
      }))

      // Act
      const wrapper = mount(Component, { localVue, propsData: { statuses } })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('({ loading: true }) renders loading', async () => {
      // Arrange - Act
      const wrapper = mount(Component, {
        localVue,
        propsData: { loading: true },
      })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })
})
