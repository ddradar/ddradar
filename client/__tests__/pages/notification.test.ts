import { mount, RouterLinkStub, shallowMount, Wrapper } from '@vue/test-utils'

import { notificationList } from '~/__tests__/data'
import { createI18n, createVue } from '~/__tests__/util'
import { getNotificationList } from '~/api/notification'
import Page from '~/pages/notification.vue'
import * as popup from '~/utils/popup'

jest.mock('~/api/notification')
jest.mock('~/utils/popup')

const localVue = createVue()

describe('/pages/notification.vue', () => {
  const messages = notificationList.map(d => ({
    ...d,
    date: '2020/8/13 0:00:00',
  }))
  const $accessor = { isAdmin: false }
  const $fetchState = { pending: false }

  describe.each(['en', 'ja'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n(locale)
    const stubs = { NuxtLink: RouterLinkStub }
    test('renders loading skeleton', async () => {
      // Arrange
      const mocks = { $fetchState: { pending: true }, $accessor }
      const data = () => ({ messages: [] })

      // Act
      const wrapper = mount(Page, { localVue, mocks, stubs, data, i18n })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('renders correctly', async () => {
      // Arrange
      const mocks = { $fetchState, $accessor }
      const data = () => ({ messages })

      // Act
      const wrapper = mount(Page, { localVue, mocks, stubs, data, i18n })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('renders empty', async () => {
      // Arrange
      const mocks = { $fetchState, $accessor }
      const data = () => ({ messages: [] })

      // Act
      const wrapper = mount(Page, { localVue, mocks, stubs, data, i18n })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('renders Edit column if admin', async () => {
      // Arrange
      const mocks = { $fetchState, $accessor: { isAdmin: true } }
      const data = () => ({ messages })

      // Act
      const wrapper = mount(Page, { localVue, mocks, stubs, data, i18n })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Lifecycle
  describe('fetch()', () => {
    let wrapper: Wrapper<Page>
    const i18n = createI18n()
    const mocks = { $accessor, $buefy: {}, $fetchState, $http: {} }
    const data = () => ({ messages: [] })
    beforeEach(() => {
      jest.mocked(getNotificationList).mockClear()
      jest.mocked(popup.danger).mockClear()
      wrapper = shallowMount(Page, { localVue, mocks, data, i18n })
    })

    test('calls getNotificationList($http)', async () => {
      // Arrange
      jest.mocked(getNotificationList).mockResolvedValue(notificationList)

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(jest.mocked(getNotificationList)).toBeCalledTimes(1)
      expect(jest.mocked(getNotificationList)).toBeCalledWith(mocks.$http)
      expect(jest.mocked(popup.danger)).not.toBeCalled()
      expect(wrapper.vm.$data.messages).toHaveLength(2)
    })
    test('calls popup.danger() if getNotificationList($http) throws error', async () => {
      // Arrange
      const errorMessage = 'invalid'
      jest.mocked(getNotificationList).mockRejectedValue(errorMessage)

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(jest.mocked(getNotificationList)).toBeCalledTimes(1)
      expect(jest.mocked(getNotificationList)).toBeCalledWith(mocks.$http)
      expect(jest.mocked(popup.danger)).toBeCalledTimes(1)
      expect(jest.mocked(popup.danger)).toBeCalledWith(
        mocks.$buefy,
        errorMessage
      )
      expect(wrapper.vm.$data.messages).toHaveLength(0)
    })
  })
})
