import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import LoginButton from '~/components/app/LoginButton.vue'
import { locales } from '~/test/test-utils'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

describe('components/app/LoginButton.vue', () => {
  test.each(locales)('{ locale: "%s" } snapshot test', async locale => {
    // Arrange
    const global = { plugins: [createI18n({ locale, legacy: false })] }
    const wrapper = mount(LoginButton, { global })
    // Act
    await wrapper.find('button').trigger('click') // Expand dropdown
    // Assert
    expect(wrapper.element).toMatchSnapshot()
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
      const global = { plugins: [createI18n({ locale: 'ja', legacy: false })] }
      const wrapper = mount(LoginButton, { global })
      // Act
      await wrapper.find('button').trigger('click') // Expand dropdown
      await wrapper.findAll("button[role='menuitem']")[i].trigger('click') // Click menu item
      // Assert
      expect(vi.mocked(navigateTo)).toBeCalledWith(`/.auth/login/${provider}`, {
        external: true,
      })
    }
  )
})
