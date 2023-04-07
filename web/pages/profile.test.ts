import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import useAuth from '~~/composables/useAuth'
import Page from '~~/pages/profile.vue'
import { mountAsync } from '~~/test/test-utils'

vi.mock('~~/composables/useAuth')

describe('Page /profile', () => {
  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })

    test('renders correctly', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useAuth).mockResolvedValue({ user: ref(null) } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: { plugins: [[Oruga, bulmaConfig], i18n] },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })
})
