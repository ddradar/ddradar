import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import Navbar from '~/components/app/Navbar.vue'
import { locales } from '~/test/test-utils'

const { useEasyAuthMock } = vi.hoisted(() => ({ useEasyAuthMock: vi.fn() }))
mockNuxtImport('useEasyAuth', () => useEasyAuthMock)

describe('components/app/Navbar.vue', () => {
  const stubs = ['LocaleSwitch', 'UserButton', 'LoginButton']

  describe.each(locales)('{ locale: "%s" } snapshot test', locale => {
    const global = { stubs, plugins: [createI18n({ locale, legacy: false })] }

    test('{ isLoggedIn: false } renders AppLoginButton', async () => {
      // Arrange - Act
      const auth = { isLoggedIn: ref(false) } as Awaited<
        ReturnType<typeof useEasyAuth>
      >
      vi.mocked(useEasyAuth).mockResolvedValue(auth)
      const wrapper = await mountSuspended(Navbar, { global })
      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })

    test('{ isLoggedIn: true } renders AppUserButton', async () => {
      // Arrange - Act
      const auth = { isLoggedIn: ref(true) } as Awaited<
        ReturnType<typeof useEasyAuth>
      >
      vi.mocked(useEasyAuth).mockResolvedValue(auth)
      const wrapper = await mountSuspended(Navbar, { global })
      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })
})
