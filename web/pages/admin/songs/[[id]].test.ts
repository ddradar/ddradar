import { testSongData } from '@ddradar/core/test/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { describe, expect, test, vi } from 'vitest'

import Page from '~~/pages/admin/songs/[[id]].vue'
import { mountAsync } from '~~/test/test-utils'

describe('Page /admin/songs', () => {
  describe('snapshot tests', () => {
    test('renders correctly', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({
        params: { id: testSongData.id },
      } as any)
      vi.mocked(useFetch).mockResolvedValue({
        data: ref(testSongData),
        refresh: vi.fn(),
      } as any)
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
