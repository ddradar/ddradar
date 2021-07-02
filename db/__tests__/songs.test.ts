import type { Container } from '@azure/cosmos'
import { mocked } from 'ts-jest/utils'

import { getContainer } from '../database'
import { fetchTotalChartCount } from '../songs'
import { createMockContainer } from './util'

jest.mock('../database')

describe('songs.ts', () => {
  describe('fetchTotalChartCount()', () => {
    test('returns [] ', async () => {
      // Arrange
      const container = createMockContainer([])
      mocked(getContainer).mockReturnValue(container as unknown as Container)

      // Act
      const result = await fetchTotalChartCount()

      // Assert
      expect(result).toHaveLength(0)
      expect(container.items.query).toBeCalledWith({
        query:
          'SELECT c.playStyle, c.level, COUNT(1) AS count ' +
          'FROM s JOIN c IN s.charts ' +
          'WHERE s.nameIndex != -1 AND s.nameIndex != -2 AND NOT (IS_DEFINED(s.deleted) AND s.deleted = true) ' +
          'GROUP BY c.playStyle, c.level',
      })
    })
  })
})
