import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import { publicUser } from '~~/../core/test/data'
import AppNavbar from '~~/components/AppNavbar.vue'
import { mountAsync } from '~~/test/test-utils'

const { navigateToMock, useRouteMock, useFetchMock, useEasyAuthMock } =
  vi.hoisted(() => ({
    navigateToMock: vi.fn(),
    useRouteMock: vi.fn(),
    useFetchMock: vi.fn(),
    useEasyAuthMock: vi.fn(),
  }))
mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useRoute', () => useRouteMock)
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useEasyAuth', () => useEasyAuthMock)

describe('components/AppNavbar.vue', () => {
  const stubs = { NuxtLink: RouterLinkStub }
  beforeEach(() => vi.mocked(useEasyAuthMock).mockClear())

  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })

    test('({ isLoggedin: false }) renders login button', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useEasyAuth).mockResolvedValue({
        isLoggedIn: ref(false),
      } as any)
      vi.mocked(useFetch).mockResolvedValue({ data: ref(null) } as any)
      vi.mocked(useRoute).mockReturnValue({ path: '/' } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

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
      vi.mocked(useEasyAuth).mockResolvedValue({
        isLoggedIn: ref(true),
      } as any)
      vi.mocked(useFetch).mockResolvedValue({ data: ref(publicUser) } as any)
      vi.mocked(useRoute).mockReturnValue({ path: '/' } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(AppNavbar, {
        global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  test('({ auth: {...}, isLoggedin: false }) redirects to /profile', async () => {
    // Arrange
    const i18n = createI18n({ legacy: false, locale: 'ja' })
    vi.mocked(navigateTo).mockClear()
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useEasyAuth).mockResolvedValue({
      isLoggedIn: ref(true),
    } as any)
    vi.mocked(useFetch).mockResolvedValue({ data: ref(null) } as any)
    vi.mocked(useRoute).mockReturnValue({ path: '/' } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    await mountAsync(AppNavbar, {
      global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
    })

    // Assert
    expect(vi.mocked(navigateTo)).toBeCalledWith('/profile')
  })

  test('({ auth: {...}, isLoggedin: false, path: "/profile" }) does not redirect to /profile', async () => {
    // Arrange
    const i18n = createI18n({ legacy: false, locale: 'ja' })
    vi.mocked(navigateTo).mockClear()
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useEasyAuth).mockResolvedValue({
      isLoggedIn: ref(true),
    } as any)
    vi.mocked(useFetch).mockResolvedValue({ data: ref(null) } as any)
    vi.mocked(useRoute).mockReturnValue({ path: '/profile' } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    await mountAsync(AppNavbar, {
      global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
    })

    // Assert
    expect(vi.mocked(navigateTo)).not.toBeCalledWith('/profile')
  })

  describe('events', () => {
    test('.navbar-burger@click sets "is-active" class', async () => {
      // Arrange
      const i18n = createI18n({ legacy: false, locale: 'ja' })
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useEasyAuth).mockResolvedValue({
        isLoggedIn: ref(false),
      } as any)
      vi.mocked(useFetch).mockResolvedValue({ data: ref(null) } as any)
      vi.mocked(useRoute).mockReturnValue({ path: '/' } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

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
