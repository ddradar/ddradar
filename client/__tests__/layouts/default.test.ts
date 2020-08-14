import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'

import DefaultLayout from '~/layouts/default.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('/layouts/default.vue', () => {
  const $fetchState = { pending: false }
  describe('snapshot test', () => {
    test('renders loading', () => {
      const wrapper = mount(DefaultLayout, {
        localVue,
        stubs: {
          NuxtLink: RouterLinkStub,
          Nuxt: true,
        },
        mocks: {
          $accessor: { auth: true, user: { name: 'User 1', id: 'user_id' } },
          $fetchState: { pending: true },
        },
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders logout button if authed', () => {
      const wrapper = mount(DefaultLayout, {
        localVue,
        stubs: {
          NuxtLink: RouterLinkStub,
          Nuxt: true,
        },
        mocks: {
          $accessor: { auth: true, user: { name: 'User 1', id: 'user_id' } },
          $fetchState,
        },
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders login button if not authed', () => {
      const wrapper = mount(DefaultLayout, {
        localVue,
        stubs: {
          NuxtLink: RouterLinkStub,
          Nuxt: true,
        },
        mocks: { $accessor: { auth: false }, $fetchState },
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
})
