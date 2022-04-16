import { mount, RouterLinkStub, shallowMount } from '@vue/test-utils'

import { createI18n, createVue } from '~/__tests__/util'
import DefaultLayout from '~/layouts/default.vue'

const localVue = createVue()

describe('/layouts/default.vue', () => {
  const stubs = { NuxtLink: RouterLinkStub, Nuxt: true, SearchBox: true }
  const templateMocks = {
    $accessor: {
      isLoggedIn: true,
      name: 'User 1',
      user: { id: 'user_id' },
    },
    $fetchState: { pending: false },
    $route: { path: '/' },
  }

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n(locale)

    test('renders loading', () => {
      const mocks = { ...templateMocks, $fetchState: { pending: true } }
      const wrapper = mount(DefaultLayout, { localVue, stubs, mocks, i18n })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders logout button if authed', () => {
      const mocks = { ...templateMocks }
      const wrapper = mount(DefaultLayout, { localVue, stubs, mocks, i18n })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders login button if not authed', () => {
      const mocks = { ...templateMocks, $accessor: { isLoggedIn: false } }
      const wrapper = mount(DefaultLayout, { localVue, stubs, mocks, i18n })
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('fetch()', () => {
    const fetchUser = jest.fn()
    const $router = { push: jest.fn() }
    const i18n = createI18n()
    beforeEach(() => {
      fetchUser.mockClear()
      $router.push.mockClear()
    })

    test('calls $accessor.fetchUser()', async () => {
      // Arrange
      const $accessor = { fetchUser, auth: true, isLoggedIn: true }
      const wrapper = shallowMount(DefaultLayout, {
        localVue,
        stubs,
        mocks: { ...templateMocks, $accessor, $router },
        i18n,
      })

      // Act
      await wrapper.vm.$options.fetch?.call(wrapper.vm, null!)

      // Assert
      expect(fetchUser).toBeCalledTimes(1)
      expect($router.push).not.toBeCalled()
    })
    test('redirects /profile if new user', async () => {
      // Arrange
      const $accessor = { fetchUser, auth: true, isLoggedIn: false }
      const wrapper = shallowMount(DefaultLayout, {
        localVue,
        stubs,
        mocks: { ...templateMocks, $accessor, $router },
        i18n,
      })

      // Act
      await wrapper.vm.$options.fetch?.call(wrapper.vm, null!)

      // Assert
      expect(fetchUser).toBeCalledTimes(1)
      expect($router.push).toBeCalledTimes(1)
      expect($router.push).lastCalledWith('/profile')
    })
  })
})
