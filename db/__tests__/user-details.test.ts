import { describe, expect, jest, test } from '@jest/globals'

import { fetchList } from '../database'
import { fetchClearAndScoreStatus } from '../user-details'

jest.mock('../database')

describe('user-details.ts', () => {
  describe('fetchClearAndScoreStatus()', () => {
    test('calls fetchList("UserDetails")', async () => {
      // Arrange
      jest.mocked(fetchList).mockResolvedValue([])

      // Act
      const result = await fetchClearAndScoreStatus('foo')

      // Assert
      expect(result).toHaveLength(0)
      expect(jest.mocked(fetchList).mock.calls[0][2]).toStrictEqual([
        { condition: 'c.userId = @', value: 'foo' },
        { condition: 'c.type = "clear" OR c.type = "score"' },
      ])
    })
  })
})
