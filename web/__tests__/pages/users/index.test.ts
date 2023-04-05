import {
  areaHiddenUser,
  privateUser,
  publicUser,
} from '@ddradar/core/test/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

import Page from '~/pages/users/index.vue'
import type { UserInfo } from '~~/server/api/v1/users/index.get'

describe('Page /users', () => {
  const users: UserInfo[] = [publicUser, areaHiddenUser, privateUser]
  const stubs = { NuxtLink: RouterLinkStub }

  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })
    test('{ users: [] } renders empty', () => {
      // Arrange - Act
      const wrapper = mount(Page, {
        global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ loading: true } renders loading state', async () => {
      // Arrange
      const wrapper = mount(Page, {
        global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
      })

      // Act
      const vm = wrapper.vm as unknown as { loading: boolean }
      vm.loading = true
      await nextTick()

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ users: [...] } renders user list', async () => {
      // Arrange
      const wrapper = mount(Page, {
        global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
      })

      // Act
      const vm = wrapper.vm as unknown as { users: UserInfo[] }
      vm.users = users
      await nextTick()

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe('search()', () => {
    test('calls GET /api/v1/users', async () => {
      // Arrange
      vi.mocked($fetch).mockResolvedValue([])
      const i18n = createI18n({ legacy: false, locale: 'ja' })
      const wrapper = mount(Page, {
        global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
      })

      // Act
      await (wrapper.vm as unknown as { search(): Promise<void> }).search()

      // Assert
      expect(vi.mocked($fetch)).toBeCalledWith('/api/v1/users', {
        query: { area: 0, code: undefined, name: '' },
      })
    })
  })
})
