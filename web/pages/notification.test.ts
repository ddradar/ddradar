import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import { notifications } from '~~/../core/test/data'
import Page from '~~/pages/notification.vue'
import { mountAsync } from '~~/test/test-utils'
import { createClientPrincipal } from '~~/test/test-utils-server'

const { useEasyAuthMock, useLazyFetchMock } = vi.hoisted(() => ({
  useEasyAuthMock: vi.fn(),
  useLazyFetchMock: vi.fn(),
}))
mockNuxtImport('useEasyAuth', () => useEasyAuthMock)
mockNuxtImport('useLazyFetch', () => useLazyFetchMock)

vi.mock('~~/utils/format', async origin => {
  const actual = (await origin()) as typeof import('~~/utils/format')
  return {
    ...actual,
    unixTimeToString: (u: number) => new Date(u * 1000).toUTCString(),
  }
})

describe('Page /notification', () => {
  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })

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
      const wrapper = await mountAsync(Page, {
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })

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
      const wrapper = await mountAsync(Page, {
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })

      // Assert
      expect(wrapper.find('.mdi.mdi-pencil-box-outline').exists()).toBeTruthy()
    })

    test('({ loading: true }) renders loading state', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useEasyAuth).mockResolvedValue({
        clientPrincipal: ref(createClientPrincipal('', '', false)),
      } as any)
      vi.mocked(useLazyFetch).mockResolvedValue({
        pending: ref(true),
        data: ref(null),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })

      // Assert
      expect(wrapper.find('.o-load.loading').exists()).toBeTruthy()
      expect(wrapper.find('td > section.section').element).toMatchSnapshot()
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
      const wrapper = await mountAsync(Page, {
        global: {
          plugins: [[Oruga, bulmaConfig], i18n],
          stubs: { NuxtLink: RouterLinkStub },
        },
      })

      // Assert
      expect(
        wrapper.find('tbody > tr > td > section.section').element
      ).toMatchSnapshot()
    })
  })
})
