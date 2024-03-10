import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import { areaHiddenUser, privateUser, publicUser } from '~/../core/test/data'
import Page from '~/pages/users/index.vue'
import type { UserInfo } from '~/schemas/user'
import { locales } from '~/test/test-utils'

const { useFetchMock } = vi.hoisted(() => ({ useFetchMock: vi.fn() }))
mockNuxtImport('useFetch', () => useFetchMock)

describe('/users', () => {
  const users: UserInfo[] = [publicUser, areaHiddenUser, privateUser]

  describe.each(locales)('{ locale: "%s" } snapshot test', locale => {
    const global = { plugins: [createI18n({ locale, legacy: false })] }

    test('{ users: [] } renders empty', async () => {
      // Arrange
      vi.mocked(useFetch).mockReturnValue({
        status: ref('idle'),
        data: ref([]),
        execute: vi.fn(),
      } as any)
      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ status: "pending" } renders loading state', async () => {
      // Arrange
      vi.mocked(useFetch).mockReturnValue({
        status: ref('pending'),
        data: ref([]),
        execute: vi.fn(),
      } as any)
      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ users: [...] } renders user list', async () => {
      // Arrange
      vi.mocked(useFetch).mockReturnValue({
        status: ref('success'),
        data: ref(users),
        execute: vi.fn(),
      } as any)
      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })
})
