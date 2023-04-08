import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'
import { createI18n } from 'vue-i18n'

import Page from '~~/pages/index.vue'
import { mountAsync } from '~~/test/test-utils'

describe('Page /', () => {
  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })
    test('renders collectly', async () => {
      // Arrange - Act
      const wrapper = await mountAsync(Page, {
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })
})
