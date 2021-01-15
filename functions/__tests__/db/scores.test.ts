import type { Container, ItemDefinition } from '@azure/cosmos'
import { mocked } from 'ts-jest/utils'

import type { ClearLamp, ScoreSchema } from '../../core/db/scores'
import { ClearStatusSchema, ScoreStatusSchema } from '../../core/db/userDetails'
import { getContainer } from '../../db'
import {
  fetchScore,
  fetchSummeryClearLampCount,
  fetchSummeryRankCount,
} from '../../db/scores'

jest.mock('../../db')

describe('/db/scores.ts', () => {
  describe('fetchScore', () => {
    let resources: (ScoreSchema & ItemDefinition)[] = []
    const container = {
      items: {
        query: jest.fn(() => ({ fetchNext: async () => ({ resources }) })),
      },
    }
    beforeAll(() =>
      mocked(getContainer).mockReturnValue((container as unknown) as Container)
    )
    beforeEach(() => {
      container.items.query.mockClear()
      resources = []
    })

    test('returns resources[0]', async () => {
      // Act
      const resource: ScoreSchema & ItemDefinition = {
        id: 'foo',
        songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
        songName: 'PARANOiA',
        playStyle: 1,
        difficulty: 0,
        level: 4,
        userId: 'foo',
        userName: 'foo',
        isPublic: true,
        score: 1000000,
        clearLamp: 7,
        rank: 'AAA',
      }
      resources = [resource]
      const result = await fetchScore('foo', '', 1, 0)

      // Assert
      expect(result).toBe(resource)
      expect(container.items.query).toBeCalled()
    })

    test('returns null', async () => {
      // Act
      const result = await fetchScore('foo', '', 1, 0)

      // Assert
      expect(result).toBeNull()
      expect(container.items.query).toBeCalled()
    })
  })
  describe('fetchSummeryClearLampCount', () => {
    let resources: ClearStatusSchema[] = []
    const container = {
      items: {
        query: jest.fn(() => ({ fetchAll: async () => ({ resources }) })),
      },
    }
    beforeAll(() =>
      mocked(getContainer).mockReturnValue((container as unknown) as Container)
    )
    beforeEach(() => {
      container.items.query.mockClear()
      resources = []
    })
    test('returns ClearStatusSchema[]', async () => {
      // Arrange
      const length = 19 * 8
      resources.push(
        ...[...Array(length).keys()].map(i => ({
          userId: 'foo',
          type: 'clear' as const,
          playStyle: ((i % 2) + 1) as 1 | 2,
          level: (i % 19) + 1,
          clearLamp: (i % 8) as ClearLamp,
          count: 10,
        }))
      )

      // Act
      const result = await fetchSummeryClearLampCount()

      // Assert
      expect(result).toHaveLength(length)
    })
  })
  describe('fetchSummeryRankCount', () => {
    let resources: ScoreStatusSchema[] = []
    const container = {
      items: {
        query: jest.fn(() => ({ fetchAll: async () => ({ resources }) })),
      },
    }
    beforeAll(() =>
      mocked(getContainer).mockReturnValue((container as unknown) as Container)
    )
    beforeEach(() => {
      container.items.query.mockClear()
      resources = []
    })
    test('returns ClearStatusSchema[]', async () => {
      // Arrange
      const length = 19 * 8
      resources.push(
        ...[...Array(length).keys()].map(i => ({
          userId: 'foo',
          type: 'score' as const,
          playStyle: ((i % 2) + 1) as 1 | 2,
          level: (i % 19) + 1,
          rank: 'AA' as const,
          count: 10,
        }))
      )

      // Act
      const result = await fetchSummeryRankCount()

      // Assert
      expect(result).toHaveLength(length)
    })
  })
})
