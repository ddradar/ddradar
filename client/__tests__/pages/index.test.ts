import { mount, RouterLinkStub, shallowMount, Wrapper } from '@vue/test-utils'

import { notificationList } from '~/__tests__/data'
import { createI18n, createVue } from '~/__tests__/util'
import { getNotificationList } from '~/api/notification'
import IndexPage from '~/pages/index.vue'
import * as popup from '~/utils/popup'

jest.mock('~/api/notification')
jest.mock('~/utils/popup')

const localVue = createVue()

describe('/pages/index.vue', () => {
  const messages = [...notificationList]
  const stubs = { NuxtLink: RouterLinkStub, SearchBox: true, TopMessage: true }

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n(locale)
    const data = () => ({ messages })

    test('renders loading skeleton', () => {
      const mocks = { $fetchState: { pending: true } }
      const wrapper = mount(IndexPage, { localVue, mocks, stubs, data, i18n })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders correctly', () => {
      const mocks = { $fetchState: { pending: false } }
      const wrapper = mount(IndexPage, { localVue, mocks, stubs, data, i18n })
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('fetch()', () => {
    let wrapper: Wrapper<IndexPage>
    const i18n = createI18n()
    const mocks = { $buefy: {}, $fetchState: { pending: true }, $http: {} }
    const data = () => ({ messages: [] })
    beforeEach(() => {
      jest.mocked(getNotificationList).mockClear()
      jest.mocked(popup.danger).mockClear()
      wrapper = shallowMount(IndexPage, { localVue, mocks, stubs, data, i18n })
    })

    test('calls getNotificationList($http, true)', async () => {
      // Arrange
      jest.mocked(getNotificationList).mockResolvedValue(messages)

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(jest.mocked(getNotificationList)).toBeCalledTimes(1)
      expect(jest.mocked(getNotificationList)).toBeCalledWith(mocks.$http, true)
      expect(jest.mocked(popup.danger)).not.toBeCalled()
      expect(wrapper.vm.$data.messages).toHaveLength(2)
    })
    test('calls popup.danger() if getNotificationList($http, true) throws error', async () => {
      // Arrange
      const errorMessage = 'invalid'
      jest.mocked(getNotificationList).mockRejectedValue(errorMessage)

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(jest.mocked(getNotificationList)).toBeCalledTimes(1)
      expect(jest.mocked(getNotificationList)).toBeCalledWith(mocks.$http, true)
      expect(jest.mocked(popup.danger)).toBeCalledTimes(1)
      expect(jest.mocked(popup.danger)).toBeCalledWith(
        mocks.$buefy,
        errorMessage
      )
      expect(wrapper.vm.$data.messages).toHaveLength(0)
    })
    test('does not call popup.danger() if getNotificationList($http, true) throws 404', async () => {
      // Arrange
      const errorMessage = '404'
      jest.mocked(getNotificationList).mockRejectedValue(errorMessage)

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(jest.mocked(getNotificationList)).toBeCalledTimes(1)
      expect(jest.mocked(getNotificationList)).toBeCalledWith(mocks.$http, true)
      expect(jest.mocked(popup.danger)).not.toBeCalled()
      expect(wrapper.vm.$data.messages).toHaveLength(0)
    })
  })
})
