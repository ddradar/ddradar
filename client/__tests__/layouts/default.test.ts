import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'
import VueI18n, { IVueI18n } from 'vue-i18n'

import DefaultLayout from '~/layouts/default.vue'

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.mixin({
  methods: {
    localePath: (obj: object) => obj,
    switchLocalePath: (code: string) => code,
  },
})
localVue.use(VueI18n)

describe('/layouts/default.vue', () => {
  const $i18n: Partial<IVueI18n> = {
    locale: 'ja',
    locales: [
      { code: 'en', iso: 'en-US', flag: 'us', name: 'English' },
      { code: 'ja', iso: 'ja-JP', flag: 'jp', name: '日本語' },
    ],
  }
  const stubs = { NuxtLink: RouterLinkStub, Nuxt: true }
  const $fetchState = { pending: false }
  const $route = { path: '/' }
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  describe('snapshot test', () => {
    test.each(['ja', 'en'])('{ locale: "%s" } renders loading', locale => {
      const i18n = new VueI18n({ locale, silentFallbackWarn: true })
      const wrapper = mount(DefaultLayout, {
        localVue,
        stubs,
        mocks: {
          $accessor: {
            isLoggedIn: true,
            name: 'User 1',
            user: { id: 'user_id' },
          },
          $fetchState: { pending: true },
          $i18n,
          $route,
        },
        i18n,
      })
      expect(wrapper).toMatchSnapshot()
    })
    test.each(['ja', 'en'])(
      '{ locale: "%s" } renders logout button if authed',
      locale => {
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const wrapper = mount(DefaultLayout, {
          localVue,
          stubs,
          mocks: {
            $accessor: {
              isLoggedIn: true,
              name: 'User 1',
              user: { id: 'user_id' },
            },
            $fetchState,
            $i18n,
            $route,
          },
          i18n,
        })
        expect(wrapper).toMatchSnapshot()
      }
    )
    test.each(['ja', 'en'])(
      '{ locale: "%s" } renders login button if not authed',
      locale => {
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const wrapper = mount(DefaultLayout, {
          localVue,
          stubs,
          mocks: {
            $accessor: { isLoggedIn: false },
            $i18n,
            $fetchState,
            $route,
          },
          i18n,
        })
        expect(wrapper).toMatchSnapshot()
      }
    )
  })
  describe('fetch()', () => {
    const fetchUser = jest.fn()
    const $router = { push: jest.fn() }
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
        mocks: { $accessor, $fetchState, $i18n, $router, $route },
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
        mocks: { $accessor, $fetchState, $i18n, $router, $route },
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
