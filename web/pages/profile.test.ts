import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import Oruga, { useProgrammatic } from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import { publicUser } from '~~/../core/test/data'
import Page from '~~/pages/profile.vue'
import { mountAsync } from '~~/test/test-utils'

const { useFetchMock } = vi.hoisted(() => ({ useFetchMock: vi.fn() }))
mockNuxtImport('useFetch', () => useFetchMock)

const open = vi.fn()
vi.mock('@oruga-ui/oruga-next', async origin => {
  const actual = (await origin()) as typeof import('@oruga-ui/oruga-next')
  return { ...actual, useProgrammatic: vi.fn() }
})
vi.mocked(useProgrammatic).mockReturnValue({
  oruga: { notification: { open } },
})

describe('Page /profile', () => {
  const i18n = createI18n({ legacy: false, locale: 'ja' })

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })

    test('renders correctly', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useFetch).mockResolvedValue({ data: ref(null) } as any)
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
      vi.mocked(useFetch).mockResolvedValue({ data: ref(user) } as any)
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
    vi.mocked(useFetch).mockResolvedValue({ data: ref(null) } as any)
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
    vi.mocked(useFetch).mockResolvedValue({ data: ref(null) } as any)
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
    test.skip('{ id: <Duplicated ID> } sets error', async () => {
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
    test.skip('{ id: <Avaliable ID> } does not set error', async () => {
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
    test.skip('sets type: "" if API call failed', async () => {
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
  describe.skip('save()', async () => {
    const refresh = vi.fn()
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useFetch).mockResolvedValue({
      data: ref(publicUser),
      refresh,
    } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const wrapper = await mountAsync(Page, {
      global: { plugins: [[Oruga, bulmaConfig], i18n] },
    })
    const vm = wrapper.getComponent(Page).vm as unknown as {
      save(): Promise<void>
      id: string
      variant: string
      message: string
    }

    beforeEach(() => {
      open.mockClear()
      refresh.mockClear()
    })

    test('calls saveUser() and notifies Success', async () => {
      // Arrange - Act
      await vm.save()

      // Assert
      expect(open).toBeCalledWith({
        message: '保存しました',
        variant: 'success',
        position: 'top',
      })
    })
    test('notifies Error if saveUser() throws error', async () => {
      // Arrange
      refresh.mockRejectedValue('Error')
      // Act
      await vm.save()

      // Assert
      expect(open).toBeCalledWith({
        message: 'Error',
        variant: 'danger',
        position: 'top',
      })
    })
  })
})
