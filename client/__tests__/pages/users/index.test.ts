import type { Api } from '@ddradar/core'
import { mount, RouterLinkStub, shallowMount } from '@vue/test-utils'

import { createI18n, createVue } from '~/__tests__/util'
import { getUserList } from '~/api/user'
import UserListPage from '~/pages/users/index.vue'
import { danger } from '~/utils/popup'

jest.mock('~/api/user')
jest.mock('~/utils/popup')

const localVue = createVue()

describe('pages/users/index.vue', () => {
  const users = [...Array(10).keys()].map(i => ({
    id: `user_${i}`,
    name: `User ${i}`,
    area: i,
  })) as Api.UserInfo[]
  const stubs = { NuxtLink: RouterLinkStub }

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n(locale)
    test('renders correctly', async () => {
      const wrapper = mount(UserListPage, { localVue, i18n, stubs })
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
    test('renders user list', async () => {
      const data = () => ({ users })
      const wrapper = mount(UserListPage, { localVue, i18n, stubs, data })
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
    test('renders loading', async () => {
      const data = () => ({ loading: true })
      const wrapper = mount(UserListPage, { localVue, i18n, stubs, data })
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('search()', () => {
    const dangerMock = jest.mocked(danger)
    const apiMock = jest.mocked(getUserList)
    const i18n = createI18n()
    const mocks = { $buefy: {}, $http: {} }
    const d = { name: 'foo', area: 13, code: 10000000 }
    beforeEach(() => {
      dangerMock.mockClear()
      apiMock.mockClear()
    })

    test('calls getUserList($http, name, area, code)', async () => {
      // Arrange
      apiMock.mockResolvedValue(users)
      const wrapper = shallowMount(UserListPage, {
        localVue,
        i18n,
        mocks,
        stubs,
        data: () => ({ ...d }),
      })

      // Act
      // @ts-ignore
      await wrapper.vm.search()

      // Assert
      expect(apiMock).toBeCalledWith(mocks.$http, d.name, d.area, d.code)
      expect(dangerMock).not.toBeCalled()
      expect(wrapper.vm.$data.users).toBe(users)
    })
    test('calls popup.danger($buefy) if cause error', async () => {
      // Arrange
      const message = '500'
      apiMock.mockRejectedValue(message)
      const wrapper = shallowMount(UserListPage, {
        localVue,
        i18n,
        mocks,
        stubs,
        data: () => ({ ...d }),
      })

      // Act
      // @ts-ignore
      await wrapper.vm.search()

      // Assert
      expect(apiMock).toBeCalledWith(mocks.$http, d.name, d.area, d.code)
      expect(dangerMock).toBeCalledWith(mocks.$buefy, message)
    })
  })
})
