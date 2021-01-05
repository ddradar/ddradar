import type { Container, ItemDefinition } from '@azure/cosmos'
import { mocked } from 'ts-jest/utils'

import type { ScoreSchema } from '../../core/db/scores'
import { getContainer } from '../../db'
import { fetchScore } from '../../db/scores'

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
})
