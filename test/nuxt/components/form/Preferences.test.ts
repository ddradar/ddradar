import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'

import Preferences from '~/components/form/Preferences.vue'
import { locales } from '~~/test/nuxt/const'

describe('components/form/Preferences.vue', () => {
  test.each(locales)('(locale: %s) renders properly', async locale => {
    // Arrange - Act
    const wrapper = await mountSuspended(Preferences)
    await wrapper.vm.$i18n.setLocale(locale)

    // Assert
    expect(wrapper.html()).toMatchSnapshot()
  })
})
