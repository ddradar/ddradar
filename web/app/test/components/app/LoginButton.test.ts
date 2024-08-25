import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import LoginButton from '~/components/app/LoginButton.vue'
import { global, locales } from '~/test/utils'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

describe('components/app/LoginButton.vue', () => {
  test.each(locales)('{ locale: "%s" } snapshot test', async locale => {
    // Arrange
    const stubs = { RouterLink: RouterLinkStub }
    const global = { stubs, plugins: [createI18n({ locale, legacy: false })] }
    const wrapper = await mountSuspended(LoginButton, { global })
    // Act
    await wrapper.find('button').trigger('click') // Expand dropdown
    // Assert
    expect(wrapper.find('div').element).toMatchSnapshot()
  })

  test.each([
    [0, 'twitter'],
    [1, 'line'],
    [2, 'github'],
  ])(
    'click menu:%i calls navigateTo("/.auth/login/%s")',
    async (i, provider) => {
      // Arrange
      vi.mocked(navigateTo).mockClear()
      const wrapper = await mountSuspended(LoginButton, { global })
      // Act
      await wrapper.find('button').trigger('click') // Expand dropdown
      await wrapper.findAll("button[role='menuitem']")[i]?.trigger('click') // Click menu item
      // Assert
      expect(vi.mocked(navigateTo)).toHaveBeenCalledWith(
        `/.auth/login/${provider}`,
        {
          external: true,
        }
      )
    }
  )
})
