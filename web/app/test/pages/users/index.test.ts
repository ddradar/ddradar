import {
  areaHiddenUser,
  privateUser,
  publicUser,
} from '@ddradar/core/test/data'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import Page from '~/pages/users/index.vue'
import { locales } from '~/test/utils'
import type { UserInfo } from '~~/schemas/user'

const { useFetchMock } = vi.hoisted(() => ({ useFetchMock: vi.fn() }))
mockNuxtImport('useFetch', () => useFetchMock)

describe('/users', () => {
  const users: UserInfo[] = [publicUser, areaHiddenUser, privateUser]

  describe.each(locales)('{ locale: "%s" } snapshot test', locale => {
    const global = { plugins: [createI18n({ locale, legacy: false })] }

    test('{ users: [] } renders empty', async () => {
      // Arrange
      const res = {
        status: ref('idle'),
        data: ref([]),
        execute: vi.fn(),
      } as unknown as ReturnType<typeof useFetch>
      vi.mocked(useFetch).mockReturnValue(res)

      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ status: "pending" } renders loading state', async () => {
      // Arrange
      const res = {
        status: ref('pending'),
        data: ref([]),
        execute: vi.fn(),
      } as unknown as ReturnType<typeof useFetch>
      vi.mocked(useFetch).mockReturnValue(res)

      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ users: [...] } renders user list', async () => {
      // Arrange
      const res = {
        status: ref('success'),
        data: ref(users),
        execute: vi.fn(),
      } as unknown as ReturnType<typeof useFetch>
      vi.mocked(useFetch).mockReturnValue(res)

      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })
})
