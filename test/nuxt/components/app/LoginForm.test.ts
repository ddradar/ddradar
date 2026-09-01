import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import LoginForm from '~/components/app/LoginForm.vue'
import { locales } from '~~/test/nuxt/const'

describe('app/components/app/LoginForm.vue', () => {
  describe.each(locales)('(locale: %s)', locale => {
    beforeEach(async () => await useNuxtApp().$i18n.setLocale(locale))
    afterEach(async () => await useNuxtApp().$i18n.setLocale('en'))

    test('renders properly', async () => {
      // Arrange - Act
      const wrapper = await mountSuspended(LoginForm)

      // Assert
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})
