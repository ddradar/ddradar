import type { Container } from '@azure/cosmos'

import { getContainer } from '../database'
import { fetchTotalChartCount } from '../songs'

jest.mock('../database')

describe('songs.ts', () => {
  describe('fetchTotalChartCount()', () => {
    test('returns [] ', async () => {
      // Arrange
      const container = {
        items: {
          query: jest.fn(() => ({ fetchAll: async () => ({ resources: [] }) })),
        },
      }
      jest
        .mocked(getContainer)
        .mockReturnValue(container as unknown as Container)

      // Act
      const result = await fetchTotalChartCount()

      // Assert
      expect(result).toHaveLength(0)
      expect(container.items.query).toBeCalledTimes(1)
    })
  })
})
