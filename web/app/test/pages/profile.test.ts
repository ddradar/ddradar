import { publicUser } from '@ddradar/core/test/data'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import Page from '~/pages/profile.vue'
import { locales } from '~/test/utils'

const { useFetchMock } = vi.hoisted(() => ({ useFetchMock: vi.fn() }))
mockNuxtImport('useFetch', () => useFetchMock)

describe('/profile', () => {
  describe.each(locales)('{ locale: "%s" } snapshot test', locale => {
    const global = { plugins: [createI18n({ legacy: false, locale })] }

    test('{ user: null } renders id input', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useFetch).mockImplementation(uri =>
        uri === '/api/v2/user'
          ? (Promise.resolve({ data: ref({ id: '' }) }) as any)
          : { data: ref(false), status: ref('idle'), execute: vi.fn() }
      )
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })

    test('{ user: {...} } renders disabled id input', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useFetch).mockImplementation(uri =>
        uri === '/api/v2/user'
          ? (Promise.resolve({ data: ref(publicUser) }) as any)
          : { data: ref(false), status: ref('idle'), execute: vi.fn() }
      )
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })
})
