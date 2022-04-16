import type { NuxtError } from '@nuxt/types'
import { mount, RouterLinkStub } from '@vue/test-utils'

import { createI18n, createVue } from '~/__tests__/util'
import ErrorPage from '~/layouts/error.vue'

const localVue = createVue()

describe('layouts/error.vue', () => {
  const stubs = { NuxtLink: RouterLinkStub }
  const error: NuxtError = { message: 'Error Message', path: '/foo' }

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n(locale)
    test('{ statusCode: 404 } renders Not Found error page', () => {
      const propsData = { error: { ...error, statusCode: 404 } }
      const wrapper = mount(ErrorPage, { localVue, stubs, propsData, i18n })
      expect(wrapper).toMatchSnapshot()
    })
    test('{ statusCode: 500 } renders other error page', () => {
      const propsData = { error: { ...error, statusCode: 500 } }
      const wrapper = mount(ErrorPage, { localVue, stubs, propsData, i18n })
      expect(wrapper).toMatchSnapshot()
    })
  })
})
