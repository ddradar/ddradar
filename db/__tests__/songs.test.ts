import type { Container } from '@azure/cosmos'
import { describe, expect, test, vi } from 'vitest'

import { getContainer } from '../database'
import { fetchTotalChartCount } from '../songs'

vi.mock('../database')

describe('songs.ts', () => {
  describe('fetchTotalChartCount()', () => {
    test('returns [] ', async () => {
      // Arrange
      const container = {
        items: {
          query: vi.fn(() => ({ fetchAll: async () => ({ resources: [] }) })),
        },
      }
      vi.mocked(getContainer).mockReturnValue(container as unknown as Container)

      // Act
      const result = await fetchTotalChartCount()

      // Assert
      expect(result).toHaveLength(0)
      expect(container.items.query).toBeCalledTimes(1)
    })
  })
})
