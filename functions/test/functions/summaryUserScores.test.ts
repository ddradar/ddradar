import type { ItemDefinition } from '@azure/cosmos'
import { InvocationContext } from '@azure/functions'
import type { ScoreSchema } from '@ddradar/core'
import { fetchClearAndScoreStatus, generateGrooveRadar } from '@ddradar/db'
import { beforeAll, describe, expect, test, vi } from 'vitest'

import { handler } from '../../src/functions/summaryUserScores'

vi.mock('@ddradar/db')

describe('/functions/summaryUserScores.ts', () => {
  beforeAll(() => {
    vi.mocked(generateGrooveRadar).mockImplementation((userId, playStyle) =>
      Promise.resolve({ userId, playStyle, ...radar, type: 'radar' })
    )
  })

  const score: ScoreSchema & ItemDefinition = {
    id: 'foo',
    userId: 'foo',
    userName: 'foo',
    isPublic: false,
    songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
    songName: 'PARANOiA',
    playStyle: 1,
    difficulty: 1,
    level: 8,
    clearLamp: 7,
    score: 1000000,
    rank: 'AAA',
    exScore: 264 * 3,
    maxCombo: 264,
  }
  const radar = { stream: 56, voltage: 44, air: 18, freeze: 0, chaos: 4 }

  test('returns [] if scores only include Area top', async () => {
    // Arrange
    const areaScores = [...Array(10).keys()].map(n => ({
      ...score,
      id: `area-${n}`,
      userId: `${n}`,
    }))

    // Act
    const result = await handler(areaScores, new InvocationContext())

    // Assert
    expect(result).toHaveLength(0)
  })

  test('returns [GrooveRadar(SP), GrooveRadar(DP), ClearStatus, ScoreStatus] if scores include user score', async () => {
    // Arrange
    vi.mocked(fetchClearAndScoreStatus).mockResolvedValueOnce([])
    const userScore = { ...score, radar }

    // Act
    const result = await handler([userScore], new InvocationContext())

    // Assert
    expect(result).toHaveLength(4)
  })

  test('returns [GrooveRadar(SP), GrooveRadar(DP), ClearStatus(4), ScoreStatus(4), ClearStatus(8), ScoreStatus(8)] if scores include old & new score', async () => {
    // Arrange
    const detail = { userId: 'foo', playStyle: 1, level: 8, count: 1 } as const
    vi.mocked(fetchClearAndScoreStatus).mockResolvedValue([
      { ...detail, type: 'clear', clearLamp: 5 },
      { ...detail, type: 'score', rank: 'AA+' },
      { ...detail, type: 'clear', clearLamp: 7 },
      { ...detail, type: 'score', rank: 'AAA' },
    ])
    const userScores: (ScoreSchema & ItemDefinition)[] = [
      { ...score, radar, clearLamp: 5, score: 980000, rank: 'AA+', ttl: 3600 },
      { ...score, radar, ttl: -1 },
      { ...score, radar, difficulty: 0, level: 4 },
    ]

    // Act
    const result = await handler(userScores, new InvocationContext())

    // Assert
    expect(result).toHaveLength(8)
  })

  test('returns [GrooveRadar(SP), GrooveRadar(DP)] if scores include only old score', async () => {
    // Arrange
    vi.mocked(fetchClearAndScoreStatus).mockResolvedValueOnce([])
    const userScore = { ...score, radar, ttl: 3600 }

    // Act
    const result = await handler([userScore], new InvocationContext())

    // Assert
    expect(result).toHaveLength(2)
  })
})
