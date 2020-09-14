import type { NuxtError } from '@nuxt/types'
import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'
import VueI18n from 'vue-i18n'

import ErrorPage from '~/layouts/error.vue'

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('layouts/error.vue', () => {
  const stubs = { NuxtLink: RouterLinkStub }
  test.each(['ja', 'en'])(
    '{ locale: "%s" } renders Not Found error page',
    locale => {
      const i18n = new VueI18n({ locale, silentFallbackWarn: true })
      const error: NuxtError = {
        message: 'This page could not be found',
        path: '/foo',
        statusCode: 404,
      }
      const propsData = { error }
      const wrapper = mount(ErrorPage, { localVue, stubs, propsData, i18n })
      expect(wrapper).toMatchSnapshot()
    }
  )
  test.each(['ja', 'en'])(
    '{ locale: "%s" } renders other error page',
    locale => {
      const i18n = new VueI18n({ locale, silentFallbackWarn: true })
      const error: NuxtError = {
        message: 'Internal Server Error',
        path: '/invalid-call',
        statusCode: 500,
      }
      const propsData = { error }
      const wrapper = mount(ErrorPage, { localVue, stubs, propsData, i18n })
      expect(wrapper).toMatchSnapshot()
    }
  )
})
