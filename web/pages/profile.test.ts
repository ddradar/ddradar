import { publicUser } from '@ddradar/core/test/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import useAuth from '~~/composables/useAuth'
import Page from '~~/pages/profile.vue'
import { mountAsync } from '~~/test/test-utils'

vi.mock('~~/composables/useAuth')

describe('Page /profile', () => {
  const i18n = createI18n({ legacy: false, locale: 'ja' })

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })

    test('renders correctly', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useAuth).mockResolvedValue({ user: ref(null) } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: { plugins: [[Oruga, bulmaConfig], i18n] },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe('isNewUser()', () => {
    test.each([
      [null, true],
      [publicUser, false],
    ])('{ user: %o } returns %o', async (user, isNewUser) => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useAuth).mockResolvedValue({ user: ref(user) } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: { plugins: [[Oruga, bulmaConfig], i18n] },
      })

      // Assert
      const vm = wrapper.getComponent(Page).vm as unknown as {
        isNewUser: boolean
      }
      expect(vm.isNewUser).toBe(isNewUser)
    })
  })
  describe('hasError()', async () => {
    const user = {
      id: publicUser.id,
      name: publicUser.name,
      area: publicUser.area,
      code: publicUser.code,
      variant: '',
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useAuth).mockResolvedValue({ user: ref(null) } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const wrapper = await mountAsync(Page, {
      global: { plugins: [[Oruga, bulmaConfig], i18n] },
    })
    test.each([
      { ...user, variant: 'danger' },
      { ...user, id: '@' },
      { ...user, name: null },
      { ...user, area: -1 },
      { ...user, code: 1.3 },
      { ...user, code: 100000000 },
    ])('%o returns true', async diff => {
      // Arrange - Act
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vm = wrapper.getComponent(Page).vm as any
      Object.entries(diff).map(([key, value]) => (vm[key] = value))

      // Assert
      expect(vm.hasError).toBe(true)
    })
    test.each([
      { ...user },
      { ...user, id: 'FOO' },
      { ...user, variant: 'success' },
      { ...user, code: null },
    ])('%o returns false', async user => {
      // Arrange - Act
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vm = wrapper.getComponent(Page).vm as any
      Object.entries(user).map(([key, value]) => (vm[key] = value))

      // Assert
      expect(vm.hasError).toBe(false)
    })
  })

  describe('checkId()', async () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useAuth).mockResolvedValue({ user: ref(null) } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const wrapper = await mountAsync(Page, {
      global: { plugins: [[Oruga, bulmaConfig], i18n] },
    })
    const vm = wrapper.getComponent(Page).vm as unknown as {
      checkId(): Promise<void>
      id: string
      variant: string
      message: string
    }
    test.each(['', '@'])('{ id: "%s" } sets error', async id => {
      // Arrange- Act
      vm.id = id
      await vm.checkId()

      // Assert
      expect(vm.variant).toBe('danger')
      expect(vm.message).not.toBe('')
    })
    test('{ id: <Duplicated ID> } sets error', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked($fetch).mockResolvedValue({ exists: true })
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      vm.id = publicUser.id
      await vm.checkId()

      // Assert
      expect(vm.variant).toBe('danger')
      expect(vm.message).not.toBe('')
    })
    test('{ id: <Avaliable ID> } does not set error', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked($fetch).mockResolvedValue({ exists: false })
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      vm.id = publicUser.id
      await vm.checkId()

      // Assert
      expect(vm.variant).toBe('success')
      expect(vm.message).not.toBe('')
    })
    test('sets type: "" if API call failed', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked($fetch).mockRejectedValue('Error')
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      vm.id = publicUser.id
      await vm.checkId()

      // Assert
      expect(vm.variant).toBe('')
    })
  })
})
