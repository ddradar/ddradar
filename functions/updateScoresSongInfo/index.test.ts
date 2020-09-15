import { ScoreSchema } from '../db/scores'
import type { SongSchema } from '../db/songs'
import updateScores from '.'

describe('/updateScoresSongInfo/index.ts', () => {
  const context = {
    log: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  }
  beforeEach(() => {
    context.log.info.mockClear()
    context.log.warn.mockClear()
    context.log.error.mockClear()
  })
  const song: SongSchema = {
    id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
    skillAttackId: 1,
    name: 'PARANOiA',
    nameKana: 'PARANOIA',
    nameIndex: 25,
    artist: '180',
    series: 'DDR 1st',
    minBPM: 180,
    maxBPM: 180,
    charts: [
      {
        playStyle: 1,
        difficulty: 0,
        level: 4,
        notes: 138,
        freezeArrow: 0,
        shockArrow: 0,
        stream: 29,
        voltage: 22,
        air: 5,
        freeze: 0,
        chaos: 0,
      },
      {
        playStyle: 1,
        difficulty: 1,
        level: 8,
        notes: 264,
        freezeArrow: 0,
        shockArrow: 0,
        stream: 56,
        voltage: 44,
        air: 18,
        freeze: 0,
        chaos: 4,
      },
    ],
  }
  const validScore: ScoreSchema = {
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

  test('returns [] with warn if songs is empty', async () => {
    // Arrange - Act
    const result = await updateScores(context, [], [])

    // Assert
    expect(result).toStrictEqual([])
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).toBeCalled()
    expect(context.log.info).not.toBeCalled()
  })

  test('returns [] with warn if songs is multiple', async () => {
    // Arrange - Act
    const result = await updateScores(context, [song, song], [])

    // Assert
    expect(result).toStrictEqual([])
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).toBeCalled()
    expect(context.log.info).not.toBeCalled()
  })

  test('returns [] with info if scores is empty', async () => {
    // Arrange - Act
    const result = await updateScores(context, [song], [])

    // Assert
    expect(result).toStrictEqual([])
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test('returns [] no need to update Scores', async () => {
    // Arrange - Act
    const result = await updateScores(context, [song], [validScore])

    // Assert
    expect(result).toStrictEqual([])
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).not.toBeCalled()
  })

  test('returns [] with error if invalid Scores', async () => {
    // Arrange
    const score = { ...validScore, playStyle: 2, difficulty: 0 } as const
    // Act
    const result = await updateScores(context, [song], [score])

    // Assert
    expect(result).toStrictEqual([])
    expect(context.log.error).toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).not.toBeCalled()
  })

  test.each([
    { ...validScore, songName: 'foo' },
    { ...validScore, level: 10 },
  ])('returns [score] if Scores info has diff', async score => {
    // Arrange - Act
    const result = await updateScores(context, [song], [score])

    // Assert
    expect(result).toStrictEqual([validScore])
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).not.toBeCalled()
  })
})
