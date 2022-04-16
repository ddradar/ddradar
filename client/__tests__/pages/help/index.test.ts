import { mount } from '@vue/test-utils'

import { createI18n, createVue } from '~/__tests__/util'
import HelpPage from '~/pages/help/index.vue'

const localVue = createVue()

describe('pages/help/index.vue', () => {
  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n(locale)
    test('renders correctly', () => {
      const wrapper = mount(HelpPage, { localVue, i18n })
      expect(wrapper).toMatchSnapshot()
    })
  })
})
