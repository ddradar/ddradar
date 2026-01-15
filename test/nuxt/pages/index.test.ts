import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'

import Page from '~/pages/index.vue'
import { locales } from '~~/test/nuxt/const'

describe('/', () => {
  describe.each(locales)('(locale: %s)', locale => {
    test('renders correctly', async () => {
      // Arrange - Act
      const wrapper = await mountSuspended(Page, { route: '/' })
      await wrapper.vm.$i18n.setLocale(locale)

      // Assert
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})
