import type { Container, ItemDefinition } from '@azure/cosmos'
import { mocked } from 'ts-jest/utils'

import { testSongData } from '../core/__tests__/data'
import type { ScoreSchema } from '../core/db/scores'
import { getContainer } from '../db'
import updateScores from '.'

jest.mock('../db')

describe('/updateScoresSongInfo/index.ts', () => {
  const context = {
    log: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  }
  let resources: ScoreSchema[] = []
  const container = {
    items: {
      query: () => ({
        fetchAll: async () => ({ resources }),
      }),
    },
  }
  beforeAll(() =>
    mocked(getContainer).mockReturnValue((container as unknown) as Container)
  )
  beforeEach(() => {
    context.log.info.mockClear()
    context.log.warn.mockClear()
    context.log.error.mockClear()
    resources = []
  })
  const song = { ...testSongData, skillAttackId: 1 }
  const validScore: ScoreSchema & ItemDefinition = {
    id: `user1-${song.name}-${song.charts[0].playStyle}-${song.charts[0].difficulty}`,
    userId: 'user1',
    userName: 'User 1',
    isPublic: true,
    songId: song.id,
    songName: song.name,
    playStyle: song.charts[0].playStyle,
    difficulty: song.charts[0].difficulty,
    level: song.charts[0].level,
    clearLamp: 6,
    score: 999960,
    rank: 'AAA',
  }

  test('returns [] if songs is empty', async () => {
    // Arrange - Act
    const result = await updateScores(context, [])

    // Assert
    expect(result).toStrictEqual([])
  })

  test('returns [] with info if scores is empty', async () => {
    // Arrange - Act
    const result = await updateScores(context, [song])

    // Assert
    expect(result).toStrictEqual([])
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test('returns [] no need to update Scores', async () => {
    // Arrange
    resources = [validScore]

    // Act
    const result = await updateScores(context, [song])

    // Assert
    expect(result).toStrictEqual([])
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test('returns [] with error if invalid Scores', async () => {
    // Arrange
    const score = { ...validScore, playStyle: 2, difficulty: 0 } as const
    resources = [score]

    // Act
    const result = await updateScores(context, [song])

    // Assert
    expect(result).toStrictEqual([])
    expect(context.log.error).toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test.each([
    { ...validScore, songName: 'foo' },
    { ...validScore, level: 10 },
  ])('returns [score] if Scores info has diff', async score => {
    // Arrange
    resources = [score]

    // Act
    const result = await updateScores(context, [song])

    // Assert
    expect(result).toStrictEqual([validScore])
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })
})
