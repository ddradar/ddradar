import { describe, expect, test, vi } from 'vitest'

import { fetchList } from '../src/database'
import { fetchClearAndScoreStatus } from '../src/user-details'

vi.mock('../src/database')

describe('user-details.ts', () => {
  describe('fetchClearAndScoreStatus()', () => {
    test('calls fetchList("UserDetails")', async () => {
      // Arrange
      vi.mocked(fetchList).mockResolvedValue([])

      // Act
      const result = await fetchClearAndScoreStatus('foo')

      // Assert
      expect(result).toHaveLength(0)
      expect(vi.mocked(fetchList).mock.calls[0][2]).toStrictEqual([
        { condition: 'c.userId = @', value: 'foo' },
        { condition: 'c.type = "clear" OR c.type = "score"' },
      ])
    })
  })
})
