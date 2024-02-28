import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import Oruga, { useProgrammatic } from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { notification } from '~~/../core/test/data'
import Page from '~~/pages/admin/notification/[[id]].vue'
import { mountAsync } from '~~/test/test-utils'

const { useFetchMock, useRouteMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  useRouteMock: vi.fn(),
}))
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useRoute', () => useRouteMock)

vi.mock('@oruga-ui/oruga-next', async origin => {
  const actual = (await origin()) as typeof import('@oruga-ui/oruga-next')
  return {
    ...actual,
    useProgrammatic: vi.fn(),
  }
})

describe('Page /admin/notification', () => {
  const modalOpen = vi.fn()
  beforeAll(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useProgrammatic).mockReturnValue({
      oruga: { modal: { open: modalOpen }, notification: { open: vi.fn() } },
    } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */
  })

  describe('snapshot tests', () => {
    test('renders correctly', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({
        params: { id: notification.id },
      } as any)
      vi.mocked(useFetch).mockResolvedValue({ data: ref(notification) } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: { plugins: [[Oruga, bulmaConfig]] },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  // Computed
  describe('pageTitle', () => {
    test.each([
      [notification.id, 'Update Notification'],
      ['', 'Add Notification'],
    ])('{ id: "%s" } returns "%s"', async (id, title) => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ params: { id } } as any)
      vi.mocked(useFetch).mockResolvedValue({ data: ref(notification) } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: { plugins: [[Oruga, bulmaConfig]] },
      })
      const vm = wrapper.getComponent(Page).vm as unknown as {
        pageTitle: string
      }

      // Assert
      expect(vm.pageTitle).toBe(title)
    })
  })

  // Method
  describe.skip('saveNotification', () => {
    beforeEach(() => {
      vi.mocked(useProgrammatic).mockClear()
      vi.mocked($fetch).mockClear()
    })

    test('calls POST /api/v1/notification', async () => {
      // Arrange
      modalOpen.mockReturnValue({ promise: Promise.resolve('yes') })
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ params: { id: '' } } as any)
      vi.mocked($fetch).mockResolvedValue({ ...notification } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: { plugins: [[Oruga, bulmaConfig]] },
      })
      const vm = wrapper.getComponent(Page).vm as unknown as {
        saveNotification(): Promise<void>
      }
      await vm.saveNotification()

      // Assert
      expect(vi.mocked($fetch)).toBeCalledWith('/api/v1/notification', {
        method: 'POST',
        body: {
          sender: 'SYSTEM',
          pinned: false,
          type: 'info',
          icon: '',
          title: '',
          body: '',
        },
      })
    })
    test.each(['no', 'canceled'])(
      'does not call API if pressed "%s"',
      async close => {
        // Arrange
        modalOpen.mockReturnValue({ promise: Promise.resolve(close) })
        /* eslint-disable @typescript-eslint/no-explicit-any */
        vi.mocked(useRoute).mockReturnValue({ params: { id: '' } } as any)
        vi.mocked($fetch).mockResolvedValue({ ...notification } as any)
        /* eslint-enable @typescript-eslint/no-explicit-any */

        // Act
        const wrapper = await mountAsync(Page, {
          global: { plugins: [[Oruga, bulmaConfig]] },
        })
        const vm = wrapper.getComponent(Page).vm as unknown as {
          saveNotification(): Promise<void>
        }
        await vm.saveNotification()

        // Assert
        expect(vi.mocked($fetch)).not.toBeCalled()
      }
    )
  })
})
