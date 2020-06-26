import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'

import DefaultLayout from '~/layouts/default.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('layouts/default.vue', () => {
  describe('renders', () => {
    test('logout button if authed', () => {
      const wrapper = mount(DefaultLayout, {
        localVue,
        stubs: {
          NuxtLink: RouterLinkStub,
          Nuxt: true,
        },
        mocks: { $accessor: { auth: true } },
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('login button if not authed', () => {
      const wrapper = mount(DefaultLayout, {
        localVue,
        stubs: {
          NuxtLink: RouterLinkStub,
          Nuxt: true,
        },
        mocks: { $accessor: { auth: false } },
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
})
