import type { ClearLamp, ScoreSchema } from '@ddradar/core'
import { testScores } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { fetchGroupedList, fetchList, fetchOne } from '../src/database'
import {
  fetchScore,
  fetchScoreList,
  fetchSummaryClearLampCount,
  fetchSummaryRankCount,
} from '../src/scores'

vi.mock('../src/database')

describe('scores.ts', () => {
  beforeEach(() => {
    vi.mocked(fetchOne).mockClear()
    vi.mocked(fetchList).mockClear()
    vi.mocked(fetchGroupedList).mockClear()
  })
  describe('fetchScore', () => {
    test('returns fetchOne() value', async () => {
      // Arrange
      const resource = { ...testScores[2], id: 'foo' }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchOne).mockResolvedValue(resource as any)

      // Act
      const result = await fetchScore('foo', '', 1, 0)

      // Assert
      expect(result).toBe(resource)
      const args = [
        vi.mocked(fetchOne).mock.calls[0][2],
        vi.mocked(fetchOne).mock.calls[0][3],
        vi.mocked(fetchOne).mock.calls[0][4],
        vi.mocked(fetchOne).mock.calls[0][5],
      ]
      expect(args).toStrictEqual([
        { condition: 'c.userId = @', value: 'foo' },
        { condition: 'c.songId = @', value: '' },
        { condition: 'c.playStyle = @', value: 1 },
        { condition: 'c.difficulty = @', value: 0 },
      ])
    })
  })
  describe('fetchScoreList', () => {
    beforeEach(() => {
      vi.mocked(fetchList).mockClear()
    })

    test('("foo") calls fetchList("Scores", columns, condition, { songName: "ASC" })', async () => {
      // Arrange
      const resources: Omit<ScoreSchema, 'userId' | 'userName' | 'isPublic'>[] =
        []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchList).mockResolvedValue(resources as any)

      // Act
      const result = await fetchScoreList('foo')

      // Assert
      expect(result).toBe(resources)
      expect(vi.mocked(fetchList).mock.calls[0][2][0]).toStrictEqual({
        condition: 'c.userId = @',
        value: 'foo',
      })
    })
    test.each([
      [{}, []],
      [
        {
          playStyle: 1,
          difficulty: 0,
          level: 3,
          clearLamp: 4,
          rank: 'AAA',
        } as const,
        [
          { condition: 'c.playStyle = @', value: 1 },
          { condition: 'c.difficulty = @', value: 0 },
          { condition: 'c.level = @', value: 3 },
          { condition: 'c.clearLamp = @', value: 4 },
          { condition: 'c.rank = @', value: 'AAA' },
        ],
      ],
    ])(
      '("foo", %o, %o) calls fetchList("Scores", columns, %o, { songName: "ASC" })',
      async (conditions, additionalConditions) => {
        // Arrange
        const resources: Omit<
          ScoreSchema,
          'userId' | 'userName' | 'isPublic'
        >[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(fetchList).mockResolvedValue(resources as any)

        // Act
        const result = await fetchScoreList('foo', conditions)

        // Assert
        expect(result).toBe(resources)
        expect(vi.mocked(fetchList).mock.calls[0][2]).toStrictEqual([
          { condition: 'c.userId = @', value: 'foo' },
          {
            condition:
              '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)',
          },
          ...additionalConditions,
        ])
      }
    )
  })
  describe('fetchSummaryClearLampCount', () => {
    test('returns ClearStatusSchema[]', async () => {
      // Arrange
      const length = 19 * 8
      vi.mocked(fetchGroupedList).mockReturnValue(
        [...Array(length).keys()].map(i => ({
          userId: 'foo',
          type: 'clear' as const,
          playStyle: ((i % 2) + 1) as 1 | 2,
          level: (i % 19) + 1,
          clearLamp: (i % 8) as ClearLamp,
          count: 10,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })) as any
      )

      // Act
      const result = await fetchSummaryClearLampCount()

      // Assert
      expect(result).toHaveLength(length)
    })
  })
  describe('fetchSummaryRankCount()', () => {
    test('returns ScoreStatusSchema[]', async () => {
      // Arrange
      const length = 19 * 8
      vi.mocked(fetchGroupedList).mockReturnValue(
        [...Array(length).keys()].map(i => ({
          userId: 'foo',
          type: 'score' as const,
          playStyle: ((i % 2) + 1) as 1 | 2,
          level: (i % 19) + 1,
          rank: 'AA' as const,
          count: 10,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })) as any
      )

      // Act
      const result = await fetchSummaryRankCount()

      // Assert
      expect(result).toHaveLength(length)
    })
  })
})
