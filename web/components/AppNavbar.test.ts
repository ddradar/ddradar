import { publicUser } from '@ddradar/core/test/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import AppNavbar from '~~/components/AppNavbar.vue'
import useAuth from '~~/composables/useAuth'
import { mountAsync } from '~~/test/test-utils'

vi.mock('~~/composables/useAuth')

describe('components/AppNavbar.vue', () => {
  const stubs = { NuxtLink: RouterLinkStub }
  beforeEach(() => vi.mocked(useAuth).mockClear())

  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })

    test('({ isLoggedin: false }) renders login button', async () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(useAuth).mockResolvedValue({ isLoggedIn: ref(false) } as any)

      // Act
      const wrapper = await mountAsync(AppNavbar, {
        global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('({ isLoggedin: true }) renders user name & logout button', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useAuth).mockResolvedValue({
        isLoggedIn: ref(true),
        id: ref(publicUser.id),
        name: ref(publicUser.name),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(AppNavbar, {
        global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe('events', () => {
    test('.navbar-burger@click sets "is-active" class', async () => {
      // Arrange
      const i18n = createI18n({ legacy: false, locale: 'ja' })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(useAuth).mockResolvedValue({ isLoggedIn: ref(false) } as any)

      // Act
      const wrapper = await mountAsync(AppNavbar, {
        global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
      })
      await wrapper.find('a.navbar-burger').trigger('click')

      // Assert
      expect(wrapper.find('a.navbar-burger').classes()).toContain('is-active')
      expect(wrapper.find('div.navbar-menu').classes()).toContain('is-active')
    })
  })
})
