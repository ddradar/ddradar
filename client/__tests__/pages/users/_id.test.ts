import type { Context } from '@nuxt/types'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { getUserInfo, UserListData } from '~/api/user'
import UserPage from '~/pages/users/_id.vue'

jest.mock('~/api/user')

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/users/_id.vue', () => {
  const user: UserListData = {
    id: 'user_1',
    name: 'User 1',
    area: 13,
    code: 12345678,
  }
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  const stubs = { NuxtLink: RouterLinkStub, PlayStatus: true }
  const templateMocks = {
    $accessor: { user: null },
    $fetchState: { pending: false },
  }
  const data = () => ({ user })

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })

    test('renders correctly', () => {
      const mocks = { ...templateMocks }
      const wrapper = mount(UserPage, { localVue, i18n, stubs, mocks, data })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders setting button if selfPage', () => {
      const mocks = { ...templateMocks, $accessor: { user: { id: user.id } } }
      const wrapper = mount(UserPage, { localVue, i18n, stubs, mocks, data })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders empty if no data', () => {
      const mocks = { ...templateMocks }
      const wrapper = mount(UserPage, { localVue, i18n, stubs, mocks })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders loading before fetch()', () => {
      const mocks = { ...templateMocks, $fetchState: { pending: true } }
      const wrapper = mount(UserPage, { localVue, i18n, stubs, mocks })
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('get areaName()', () => {
    test.each([
      ['ja', 0, '未指定'],
      ['en', 0, 'undefined'],
      ['ja', 47, '沖縄県'],
      ['en', 47, 'Okinawa'],
      ['ja', 51, 'アメリカ'],
      ['en', 51, 'USA'],
    ])('{ locale: "%s", area: %i } returns "%s"', (locale, area, expected) => {
      // Arrange
      const wrapper = shallowMount(UserPage, {
        localVue,
        i18n: new VueI18n({ locale, silentFallbackWarn: true }),
        stubs,
        mocks: templateMocks,
        data: () => ({ user: { ...user, area } }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.areaName).toBe(expected)
    })
    test.each(['ja', 'en'])(
      '{ locale: "%s" } returns "" if user is null',
      locale => {
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const mocks = { ...templateMocks }
        const wrapper = shallowMount(UserPage, { localVue, i18n, stubs, mocks })

        // Act - Assert
        // @ts-ignore
        expect(wrapper.vm.areaName).toBe('')
      }
    )
  })

  describe('get ddrCode()', () => {
    test.each([
      [0, ''],
      [10000000, '1000-0000'],
      [99999999, '9999-9999'],
    ])('{ code: %i } returns "%s"', (code, expected) => {
      // Arrange
      const wrapper = shallowMount(UserPage, {
        localVue,
        i18n,
        stubs,
        mocks: templateMocks,
        data: () => ({ user: { ...user, code } }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.ddrCode).toBe(expected)
    })
    test('returns "" if user is null', () => {
      const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
      const wrapper = shallowMount(UserPage, {
        localVue,
        i18n,
        stubs,
        mocks: templateMocks,
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.areaName).toBe('')
    })
  })

  describe('get isSelfPage()', () => {
    test('returns false if no login', () => {
      // Arrange
      const wrapper = shallowMount(UserPage, {
        localVue,
        i18n,
        stubs,
        mocks: { ...templateMocks, $accessor: { user: null } },
        data: () => ({ user }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.isSelfPage).toBe(false)
    })
    test('returns false if id !== loginId', () => {
      // Arrange
      const id = 'user_2'
      const wrapper = shallowMount(UserPage, {
        localVue,
        i18n,
        stubs,
        mocks: { ...templateMocks, $accessor: { user: { id } } },
        data: () => ({ user }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.isSelfPage).toBe(false)
    })
    test('returns true if id === loginId', () => {
      // Arrange
      const wrapper = shallowMount(UserPage, {
        localVue,
        i18n,
        stubs,
        mocks: { ...templateMocks, $accessor: { user: { id: user.id } } },
        data: () => ({ user }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.isSelfPage).toBe(true)
    })
    test('returns false if user is null', () => {
      const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
      const wrapper = shallowMount(UserPage, {
        localVue,
        i18n,
        stubs,
        mocks: templateMocks,
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.isSelfPage).toBe(false)
    })
  })

  describe('validate', () => {
    const mocks = { ...templateMocks }
    const wrapper = shallowMount(UserPage, { localVue, i18n, stubs, mocks })

    test.each(['', 'FOO', 'あああ'])('({ id: "%s" }) returns false', id => {
      // Arrange
      const ctx = ({ params: { id } } as unknown) as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
    })
    test.each(['-_-', 'foo', '000'])('({ id: "%s" }) returns true', id => {
      // Arrange
      const ctx = ({ params: { id } } as unknown) as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
    })
  })

  describe('fetch()', () => {
    const $http = {}
    const apiMock = mocked(getUserInfo)
    beforeEach(() => apiMock.mockClear())

    test('/_id calls getUserInfo(this.$http, _id)', async () => {
      // Arrange
      const $route = { params: { id: 'foo' } }
      apiMock.mockResolvedValue(user)
      const wrapper = shallowMount(UserPage, {
        localVue,
        i18n,
        stubs,
        mocks: { ...templateMocks, $http, $route },
      })

      // Act
      await wrapper.vm.$options.fetch!.call(wrapper.vm, null!)

      // Assert
      expect(apiMock).toBeCalledWith($http, $route.params.id)
      expect(wrapper.vm.$data.user).toBe(user)
    })
    test('sets user null if cause error', async () => {
      // Arrange
      const $route = { params: { id: 'foo' } }
      apiMock.mockRejectedValue('error')
      const wrapper = shallowMount(UserPage, {
        localVue,
        i18n,
        stubs,
        mocks: { ...templateMocks, $http, $route },
      })

      // Act
      await wrapper.vm.$options.fetch!.call(wrapper.vm, null!)

      // Assert
      expect(apiMock).toBeCalledWith($http, $route.params.id)
      expect(wrapper.vm.$data.user).toBeNull()
    })
  })
})
