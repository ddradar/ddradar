import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { getNotificationList, Notification } from '~/api/notification'
import NotificationPage from '~/pages/notification.vue'
import * as popup from '~/utils/popup'

jest.mock('~/api/notification')
jest.mock('~/utils/popup')
const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

type NotificationDetail = Omit<
  Notification,
  'sender' | 'pinned' | 'timeStamp'
> & {
  date: string
}

describe('/pages/notification.vue', () => {
  const messages: NotificationDetail[] = [
    {
      id: 'foo',
      icon: 'account',
      type: 'is-info',
      title: 'Title 1',
      body: '- Message Body1\n - Message Body2',
      date: '2020/8/13 0:00:00',
    },
    {
      id: 'bar',
      icon: '',
      type: 'is-info',
      title: 'Title 2',
      body: '- [Message Body2](./link)',
      date: '2020/8/13 0:00:00',
    },
  ]
  describe('snapshot test', () => {
    test('renders loading skeleton', () => {
      const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
      const wrapper = mount(NotificationPage, {
        localVue,
        mocks: {
          $fetchState: { pending: true },
          $accessor: { isAdmin: false },
        },
        stubs: { NuxtLink: RouterLinkStub },
        data: () => ({ messages: [] }),
        i18n,
      })
      expect(wrapper).toMatchSnapshot()
    })
    test.each(['en', 'ja'])('renders correctly if { locale: %s }', locale => {
      const i18n = new VueI18n({ locale, silentFallbackWarn: true })
      const wrapper = mount(NotificationPage, {
        localVue,
        mocks: {
          $fetchState: { pending: false },
          $accessor: { isAdmin: false },
        },
        stubs: { NuxtLink: RouterLinkStub },
        data: () => ({ messages }),
        i18n,
      })
      expect(wrapper).toMatchSnapshot()
    })
    test.each(['en', 'ja'])('renders empty if { locale: %s }', locale => {
      const i18n = new VueI18n({ locale, silentFallbackWarn: true })
      const wrapper = mount(NotificationPage, {
        localVue,
        mocks: {
          $fetchState: { pending: false },
          $accessor: { isAdmin: false },
        },
        stubs: { NuxtLink: RouterLinkStub },
        data: () => ({ messages: [] }),
        i18n,
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders Edit column if admin', () => {
      const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
      const wrapper = mount(NotificationPage, {
        localVue,
        mocks: {
          $fetchState: { pending: false },
          $accessor: { isAdmin: true },
        },
        stubs: { NuxtLink: RouterLinkStub },
        data: () => ({ messages }),
        i18n,
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('fetch()', () => {
    const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
    const apiMock = mocked(getNotificationList)
    const popupMock = mocked(popup.danger)
    beforeEach(() => {
      apiMock.mockClear()
      popupMock.mockClear()
    })
    test('calls getNotificationList($http)', async () => {
      // Arrange
      apiMock.mockResolvedValue([
        {
          id: 'foo',
          icon: 'account',
          type: 'is-info',
          title: 'Title 1',
          body: 'Message Body1',
          timeStamp: 1597244400, // 2020/8/13
        },
        {
          id: 'bar',
          icon: '',
          type: 'is-info',
          title: 'Title 2',
          body: 'Message Body2',
          timeStamp: 1597244400, // 2020/8/13
        },
      ])
      const $http = { $get: jest.fn() }
      const wrapper = shallowMount(NotificationPage, {
        localVue,
        mocks: { $fetchState: { pending: false }, $http },
        data: () => ({ messages: [] }),
        i18n,
      })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(apiMock).toBeCalledTimes(1)
      expect(apiMock).toBeCalledWith($http)
      expect(popupMock).not.toBeCalled()
      expect(wrapper.vm.$data.messages).toHaveLength(2)
    })
    test('calls popup.danger() if getNotificationList($http) throws error', async () => {
      // Arrange
      const errorMessage = 'invalid'
      apiMock.mockRejectedValue(errorMessage)
      const $http = { $get: jest.fn() }
      const $buefy = {}
      const wrapper = shallowMount(NotificationPage, {
        localVue,
        mocks: { $fetchState: { pending: false }, $http, $buefy },
        data: () => ({ messages: [] }),
        i18n,
      })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(apiMock).toBeCalledTimes(1)
      expect(apiMock).toBeCalledWith($http)
      expect(popupMock).toBeCalledTimes(1)
      expect(popupMock).toBeCalledWith($buefy, errorMessage)
      expect(wrapper.vm.$data.messages).toHaveLength(0)
    })
  })
})
