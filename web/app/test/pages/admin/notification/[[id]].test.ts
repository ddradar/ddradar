import { notification } from '@ddradar/core/test/data'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'

import Page from '~/pages/admin/notification/[[id]].vue'
import { global } from '~/test/utils'

const { useFetchMock, useRouteMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  useRouteMock: vi.fn(),
}))
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useRoute', () => useRouteMock)

describe('/admin/notification', () => {
  test('snapshot test', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({
      params: { id: notification.id },
    } as any)
    vi.mocked(useFetch).mockReturnValue({
      data: ref(notification),
      execute: vi.fn(),
    } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountSuspended(Page, { global })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
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
      vi.mocked(useFetch).mockReturnValue({
        data: ref(notification),
        execute: vi.fn(),
      } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountSuspended(Page, { global })

      // Assert
      expect(wrapper.find('h1').text()).toBe(title)
    })
  })
})
