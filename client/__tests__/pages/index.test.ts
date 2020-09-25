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
import IndexPage from '~/pages/index.vue'
import * as popup from '~/utils/popup'

jest.mock('~/api/notification')
jest.mock('~/utils/popup')

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/pages/index.vue', () => {
  const messages: Omit<Notification, 'sender' | 'pinned'>[] = [
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
  ]
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  describe('snapshot test', () => {
    test('renders loading skeleton', () => {
      const wrapper = mount(IndexPage, {
        localVue,
        mocks: { $fetchState: { pending: true } },
        stubs: { NuxtLink: RouterLinkStub, TopMessage: true },
        data: () => ({ messages }),
        i18n,
      })
      expect(wrapper).toMatchSnapshot()
    })
    test.each(['en', 'ja'])('renders correctly if locale is "%s"', locale => {
      const i18n = new VueI18n({ locale, silentFallbackWarn: true })
      const wrapper = mount(IndexPage, {
        localVue,
        mocks: { $fetchState: { pending: false } },
        stubs: { NuxtLink: RouterLinkStub, TopMessage: true },
        data: () => ({ messages }),
        i18n,
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('fetch()', () => {
    const apiMock = mocked(getNotificationList)
    const popupMock = mocked(popup.danger)
    beforeEach(() => {
      apiMock.mockClear()
      popupMock.mockClear()
    })
    test('calls getNotificationList($http, true)', async () => {
      // Arrange
      apiMock.mockResolvedValue(messages)
      const $http = { $get: jest.fn() }
      const wrapper = shallowMount(IndexPage, {
        localVue,
        mocks: { $fetchState: { pending: true }, $http },
        data: () => ({ messages: [] }),
        i18n,
      })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(apiMock).toBeCalledTimes(1)
      expect(apiMock).toBeCalledWith($http, true)
      expect(popupMock).not.toBeCalled()
      expect(wrapper.vm.$data.messages).toHaveLength(2)
    })
    test('calls popup.danger() if getNotificationList($http, true) throws error', async () => {
      // Arrange
      const errorMessage = 'invalid'
      apiMock.mockRejectedValue(errorMessage)
      const $http = { $get: jest.fn() }
      const $buefy = {}
      const wrapper = shallowMount(IndexPage, {
        localVue,
        mocks: { $buefy, $fetchState: { pending: true }, $http },
        data: () => ({ messages: [] }),
        i18n,
      })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(apiMock).toBeCalledTimes(1)
      expect(apiMock).toBeCalledWith($http, true)
      expect(popupMock).toBeCalledTimes(1)
      expect(popupMock).toBeCalledWith($buefy, errorMessage)
      expect(wrapper.vm.$data.messages).toHaveLength(0)
    })
  })
})
