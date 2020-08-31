import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'

import DefaultLayout from '~/layouts/default.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('/layouts/default.vue', () => {
  const stubs = { NuxtLink: RouterLinkStub, Nuxt: true }
  const $fetchState = { pending: false }
  describe('snapshot test', () => {
    test('renders loading', () => {
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
        },
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders logout button if authed', () => {
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
        },
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders login button if not authed', () => {
      const wrapper = mount(DefaultLayout, {
        localVue,
        stubs,
        mocks: { $accessor: { isLoggedIn: false }, $fetchState },
      })
      expect(wrapper).toMatchSnapshot()
    })
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
        mocks: { $accessor, $fetchState, $router },
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
        mocks: { $accessor, $fetchState, $router },
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
