import { notification } from '@ddradar/core/__tests__/data'
import { mount } from '@vue/test-utils'

import { createVue } from '~/__tests__/util'
import TopMessage from '~/components/pages/TopMessage.vue'
import { unixTimeToString } from '~/utils/date'

jest.mock('~/utils/date')
jest
  .mocked(unixTimeToString)
  .mockImplementation(unixTime => new Date(unixTime * 1000).toUTCString())

const localVue = createVue()

describe('/components/pages/TopMessage.vue', () => {
  const propsData = {
    type: notification.type,
    title: notification.title,
    body: notification.body,
    time: notification.timeStamp,
  } as const

  describe('snapshot test', () => {
    test('renders default icon if not set', () => {
      // Arrange
      const wrapper = mount(TopMessage, { localVue, propsData })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('renders specified icon', () => {
      // Arrange
      const wrapper = mount(TopMessage, {
        localVue,
        propsData: { ...propsData, icon: 'account' },
      })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
  })
})
