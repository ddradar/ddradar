import { notification } from '@ddradar/core/test/data'
import Oruga, { useProgrammatic } from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { describe, expect, test, vi } from 'vitest'

import Page from '~~/pages/admin/notification/[[id]].vue'
import { mountAsync } from '~~/test/test-utils'

vi.mock('@oruga-ui/oruga-next', async origin => {
  const actual = (await origin()) as typeof import('@oruga-ui/oruga-next')
  return {
    ...actual,
    useProgrammatic: vi.fn(),
  }
})

describe('Page /admin/notification', () => {
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

  // Method
  describe('saveNotification', () => {
    beforeEach(() => {
      vi.mocked(useProgrammatic).mockClear()
      vi.mocked($fetch).mockClear()
    })

    test('calls POST /api/v1/notification', async () => {
      // Arrange
      const modalOpen = vi.fn()
      modalOpen.mockReturnValue({ promise: Promise.resolve('yes') })
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useProgrammatic).mockReturnValue({
        oruga: { modal: { open: modalOpen }, notification: { open: vi.fn() } },
      } as any)
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
      vi.mocked($fetch).toBeCalledWith('/api/v1/notification', {
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
        const modalOpen = vi.fn()
        modalOpen.mockReturnValue({ promise: Promise.resolve(close) })
        /* eslint-disable @typescript-eslint/no-explicit-any */
        vi.mocked(useProgrammatic).mockReturnValue({
          oruga: {
            modal: { open: modalOpen },
            notification: { open: vi.fn() },
          },
        } as any)
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
        vi.mocked($fetch).not.toBeCalled()
      }
    )
  })
})
