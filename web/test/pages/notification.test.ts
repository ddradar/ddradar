import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import { notifications } from '~/../core/test/data'
import Page from '~/pages/notification.vue'
import { locales } from '~/test/test-utils'
import { createClientPrincipal } from '~/test/test-utils-server'

const { useEasyAuthMock, useLazyFetchMock, unixTimeToStringMock } = vi.hoisted(
  () => ({
    useEasyAuthMock: vi.fn(),
    useLazyFetchMock: vi.fn(),
    unixTimeToStringMock: (u: number) => new Date(u * 1000).toUTCString(),
  })
)
mockNuxtImport('useEasyAuth', () => useEasyAuthMock)
mockNuxtImport('useLazyFetch', () => useLazyFetchMock)
mockNuxtImport('unixTimeToString', () => unixTimeToStringMock)

describe('/notification', () => {
  describe.each(locales)('{ locale: "%s" } snapshot test', locale => {
    const global = { plugins: [createI18n({ legacy: false, locale })] }

    test('({ messages: [...] }) renders notification', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useEasyAuth).mockResolvedValue({
        clientPrincipal: ref(createClientPrincipal('', '', false)),
      } as any)
      vi.mocked(useLazyFetch).mockResolvedValue({
        pending: ref(false),
        data: ref(notifications),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })

    test('({ isAdmin: true }) renders Edit button', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useEasyAuth).mockResolvedValue({
        clientPrincipal: ref(createClientPrincipal('', '', true)),
      } as any)
      vi.mocked(useLazyFetch).mockResolvedValue({
        pending: ref(false),
        data: ref(notifications),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.find('table').element).toMatchSnapshot()
    })

    test('({ loading: true }) renders loading state', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useEasyAuth).mockResolvedValue({
        clientPrincipal: ref(createClientPrincipal('', '', false)),
      } as any)
      vi.mocked(useLazyFetch).mockResolvedValue({
        pending: ref(true),
        data: ref([]),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.find('table').element).toMatchSnapshot()
    })

    test('({ messages: [] }) renders no notification', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useEasyAuth).mockResolvedValue({
        clientPrincipal: ref(createClientPrincipal('', '', false)),
      } as any)
      vi.mocked(useLazyFetch).mockResolvedValue({
        pending: ref(false),
        data: ref([]),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.find('table').element).toMatchSnapshot()
    })
  })
})
