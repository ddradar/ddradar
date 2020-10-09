import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
  Wrapper,
} from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { notificationList } from '~/__tests__/data'
import { getNotificationList } from '~/api/notification'
import NotificationPage from '~/pages/notification.vue'
import * as popup from '~/utils/popup'

jest.mock('~/api/notification')
jest.mock('~/utils/popup')
const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/pages/notification.vue', () => {
  const messages = notificationList.map(d => ({
    ...d,
    date: '2020/8/13 0:00:00',
  }))
  const $accessor = { isAdmin: false }
  const $fetchState = { pending: false }

  describe('snapshot test', () => {
    test('renders loading skeleton', async () => {
      const wrapper = mount(NotificationPage, {
        localVue,
        mocks: { $fetchState: { pending: true }, $accessor },
        stubs: { NuxtLink: RouterLinkStub },
        data: () => ({ messages: [] }),
        i18n: new VueI18n({ locale: 'ja', silentFallbackWarn: true }),
      })
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
    test.each(['en', 'ja'])(
      'renders correctly if { locale: %s }',
      async locale => {
        const wrapper = mount(NotificationPage, {
          localVue,
          mocks: { $fetchState, $accessor },
          stubs: { NuxtLink: RouterLinkStub },
          data: () => ({ messages }),
          i18n: new VueI18n({ locale, silentFallbackWarn: true }),
        })
        await wrapper.vm.$nextTick()
        expect(wrapper).toMatchSnapshot()
      }
    )
    test.each(['en', 'ja'])('renders empty if { locale: %s }', async locale => {
      const wrapper = mount(NotificationPage, {
        localVue,
        mocks: { $fetchState, $accessor },
        stubs: { NuxtLink: RouterLinkStub },
        data: () => ({ messages: [] }),
        i18n: new VueI18n({ locale, silentFallbackWarn: true }),
      })
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
    test('renders Edit column if admin', async () => {
      const wrapper = mount(NotificationPage, {
        localVue,
        mocks: { $fetchState, $accessor: { isAdmin: true } },
        stubs: { NuxtLink: RouterLinkStub },
        data: () => ({ messages }),
        i18n: new VueI18n({ locale: 'ja', silentFallbackWarn: true }),
      })
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('fetch()', () => {
    let wrapper: Wrapper<NotificationPage>
    const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
    const mocks = { $accessor, $buefy: {}, $fetchState, $http: {} }
    const data = () => ({ messages: [] })
    beforeEach(() => {
      mocked(getNotificationList).mockClear()
      mocked(popup.danger).mockClear()
      wrapper = shallowMount(NotificationPage, { localVue, mocks, data, i18n })
    })

    test('calls getNotificationList($http)', async () => {
      // Arrange
      mocked(getNotificationList).mockResolvedValue(notificationList)

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(mocked(getNotificationList)).toBeCalledTimes(1)
      expect(mocked(getNotificationList)).toBeCalledWith(mocks.$http)
      expect(mocked(popup.danger)).not.toBeCalled()
      expect(wrapper.vm.$data.messages).toHaveLength(2)
    })
    test('calls popup.danger() if getNotificationList($http) throws error', async () => {
      // Arrange
      const errorMessage = 'invalid'
      mocked(getNotificationList).mockRejectedValue(errorMessage)

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(mocked(getNotificationList)).toBeCalledTimes(1)
      expect(mocked(getNotificationList)).toBeCalledWith(mocks.$http)
      expect(mocked(popup.danger)).toBeCalledTimes(1)
      expect(mocked(popup.danger)).toBeCalledWith(mocks.$buefy, errorMessage)
      expect(wrapper.vm.$data.messages).toHaveLength(0)
    })
  })
})
