import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import { createI18n } from 'vue-i18n'

import Page from '~/pages/index.vue'
import { locales } from '~/test/test-utils'

describe('/', () => {
  test.each(locales)('{ locale: "%s" } snapshot test', async locale => {
    // Arrange - Act
    const global = { plugins: [createI18n({ locale, legacy: false })] }
    const wrapper = await mountSuspended(Page, { global })
    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })
})
