import { notification } from '@ddradar/core/test/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { describe, expect, test, vi } from 'vitest'

import Page from '~~/pages/admin/notification/[[id]].vue'
import { mountAsync } from '~~/test/test-utils'

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
})
