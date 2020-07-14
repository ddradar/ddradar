import type { NuxtError } from '@nuxt/types'
import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'

import ErrorPage from '~/layouts/error.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('layouts/default.vue', () => {
  test('renders Not Found error page', () => {
    const error: NuxtError = {
      message: 'This page could not be found',
      path: '/foo',
      statusCode: 404,
    }
    const wrapper = mount(ErrorPage, {
      localVue,
      stubs: {
        NuxtLink: RouterLinkStub,
      },
      propsData: { error },
    })
    expect(wrapper).toMatchSnapshot()
  })
  test('renders other error page', () => {
    const error: NuxtError = {
      message: 'Internal Server Error',
      path: '/invalid-call',
      statusCode: 500,
    }
    const wrapper = mount(ErrorPage, {
      localVue,
      stubs: {
        NuxtLink: RouterLinkStub,
      },
      propsData: { error },
    })
    expect(wrapper).toMatchSnapshot()
  })
})
