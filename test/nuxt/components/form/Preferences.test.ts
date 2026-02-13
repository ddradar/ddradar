import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, test } from 'vitest'

import Preferences from '~/components/form/Preferences.vue'
import { locales } from '~~/test/nuxt/const'

describe('components/form/Preferences.vue', () => {
  afterEach(async () => await useNuxtApp().$i18n.setLocale('en'))

  test.each(locales)('(locale: %s) renders properly', async locale => {
    // Arrange - Act
    const wrapper = await mountSuspended(Preferences)
    await wrapper.vm.$i18n.setLocale(locale)

    // Assert
    expect(wrapper.html()).toMatchSnapshot()
  })
})
