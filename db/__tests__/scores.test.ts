import type { Database, Score } from '@ddradar/core'
import { testScores } from '@ddradar/core/__tests__/data'

import { fetchGroupedList, fetchList, fetchOne } from '../database'
import {
  fetchScore,
  fetchScoreList,
  fetchSummaryClearLampCount,
  fetchSummaryRankCount,
  generateGrooveRadar,
} from '../scores'

jest.mock('../database')

describe('scores.ts', () => {
  describe('fetchScore', () => {
    beforeEach(() => jest.mocked(fetchOne).mockClear())

    test('returns fetchOne() value', async () => {
      // Arrange
      const resource = { ...testScores[2], id: 'foo' }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.mocked(fetchOne).mockResolvedValue(resource as any)

      // Act
      const result = await fetchScore('foo', '', 1, 0)

      // Assert
      expect(result).toBe(resource)
      const args = [
        jest.mocked(fetchOne).mock.calls[0][2],
        jest.mocked(fetchOne).mock.calls[0][3],
        jest.mocked(fetchOne).mock.calls[0][4],
        jest.mocked(fetchOne).mock.calls[0][5],
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
    beforeEach(() => jest.mocked(fetchList).mockClear())

    test('("foo") calls fetchList("Scores", columns, condition, { songName: "ASC" })', async () => {
      // Arrange
      const resources: Omit<
        Database.ScoreSchema,
        'userId' | 'userName' | 'isPublic'
      >[] = []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.mocked(fetchList).mockResolvedValue(resources as any)

      // Act
      const result = await fetchScoreList('foo')

      // Assert
      expect(result).toBe(resources)
      expect(jest.mocked(fetchList).mock.calls[0][2][0]).toStrictEqual({
        condition: 'c.userId = @',
        value: 'foo',
      })
    })
    test.each([
      [{}, true, []],
      [
        {
          playStyle: 1,
          difficulty: 0,
          level: 3,
          clearLamp: 4,
          rank: 'AAA',
        } as const,
        false,
        [
          { condition: 'c.playStyle = @', value: 1 },
          { condition: 'c.difficulty = @', value: 0 },
          { condition: 'c.level = @', value: 3 },
          { condition: 'c.clearLamp = @', value: 4 },
          { condition: 'c.rank = @', value: 'AAA' },
          { condition: 'IS_DEFINED(c.radar)' },
        ],
      ],
    ])(
      '("foo", %p, %p) calls fetchList("Scores", columns, %p, { songName: "ASC" })',
      async (conditions, includeCourse, additionalConditions) => {
        // Arrange
        const resources: Omit<
          Database.ScoreSchema,
          'userId' | 'userName' | 'isPublic'
        >[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.mocked(fetchList).mockResolvedValue(resources as any)

        // Act
        const result = await fetchScoreList('foo', conditions, includeCourse)

        // Assert
        expect(result).toBe(resources)
        expect(jest.mocked(fetchList).mock.calls[0][2]).toStrictEqual([
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
      jest.mocked(fetchGroupedList).mockReturnValue(
        [...Array(length).keys()].map(i => ({
          userId: 'foo',
          type: 'clear' as const,
          playStyle: ((i % 2) + 1) as 1 | 2,
          level: (i % 19) + 1,
          clearLamp: (i % 8) as Score.ClearLamp,
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
      jest.mocked(fetchGroupedList).mockReturnValue(
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
  describe('generateGrooveRadar()', () => {
    const radar: Database.GrooveRadarSchema = {
      userId: 'public_user',
      type: 'radar',
      playStyle: 1,
      stream: 100,
      voltage: 100,
      air: 100,
      freeze: 100,
      chaos: 100,
    }

    test('returns groove radar', async () => {
      // Arrange
      jest.mocked(fetchGroupedList).mockResolvedValue([{ ...radar }])

      // Act
      const result = await generateGrooveRadar('public_user', 1)

      // Assert
      expect(result).toStrictEqual({ ...radar, id: 'radar-public_user-1' })
      expect(jest.mocked(fetchGroupedList).mock.calls[0][2]).toStrictEqual([
        { condition: 'c.userId = @', value: 'public_user' },
        { condition: 'c.playStyle = @', value: 1 },
        { condition: 'IS_DEFINED(c.radar)' },
        {
          condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)',
        },
      ])
    })

    test('returns empty groove radar if scores is empty', async () => {
      // Arrange
      jest.mocked(fetchGroupedList).mockResolvedValue([])

      // Act
      const result = await generateGrooveRadar('public_user', 1)
      const emptyRadar = { stream: 0, voltage: 0, air: 0, freeze: 0, chaos: 0 }

      expect(result).toStrictEqual({
        ...radar,
        ...emptyRadar,
        id: 'radar-public_user-1',
      })
      expect(jest.mocked(fetchGroupedList)).toBeCalled()
    })
  })
})
