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
import IndexPage from '~/pages/index.vue'
import * as popup from '~/utils/popup'

jest.mock('~/api/notification')
jest.mock('~/utils/popup')

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/pages/index.vue', () => {
  const messages = [...notificationList]
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })

  describe('snapshot test', () => {
    const data = () => ({ messages })
    const stubs = { NuxtLink: RouterLinkStub, TopMessage: true }

    test('renders loading skeleton', () => {
      const mocks = { $fetchState: { pending: true } }
      const wrapper = mount(IndexPage, { localVue, mocks, stubs, data, i18n })
      expect(wrapper).toMatchSnapshot()
    })
    test.each(['en', 'ja'])('renders correctly if locale is "%s"', locale => {
      const i18n = new VueI18n({ locale, silentFallbackWarn: true })
      const mocks = { $fetchState: { pending: false } }
      const wrapper = mount(IndexPage, { localVue, mocks, stubs, data, i18n })
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('fetch()', () => {
    let wrapper: Wrapper<IndexPage>
    const mocks = { $buefy: {}, $fetchState: { pending: true }, $http: {} }
    const data = () => ({ messages: [] })
    beforeEach(() => {
      mocked(getNotificationList).mockClear()
      mocked(popup.danger).mockClear()
      wrapper = shallowMount(IndexPage, { localVue, mocks, data, i18n })
    })

    test('calls getNotificationList($http, true)', async () => {
      // Arrange
      mocked(getNotificationList).mockResolvedValue(messages)

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(mocked(getNotificationList)).toBeCalledTimes(1)
      expect(mocked(getNotificationList)).toBeCalledWith(mocks.$http, true)
      expect(mocked(popup.danger)).not.toBeCalled()
      expect(wrapper.vm.$data.messages).toHaveLength(2)
    })
    test('calls popup.danger() if getNotificationList($http, true) throws error', async () => {
      // Arrange
      const errorMessage = 'invalid'
      mocked(getNotificationList).mockRejectedValue(errorMessage)

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(mocked(getNotificationList)).toBeCalledTimes(1)
      expect(mocked(getNotificationList)).toBeCalledWith(mocks.$http, true)
      expect(mocked(popup.danger)).toBeCalledTimes(1)
      expect(mocked(popup.danger)).toBeCalledWith(mocks.$buefy, errorMessage)
      expect(wrapper.vm.$data.messages).toHaveLength(0)
    })
  })
})
