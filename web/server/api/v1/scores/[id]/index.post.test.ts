import { calcMyGrooveRadar } from '@ddradar/core'
import {
  areaHiddenUser,
  privateUser,
  publicUser,
  testScores,
  testSongData,
} from '@ddradar/core/test/data'
import { fetchList, fetchOne, getContainer } from '@ddradar/db'
import { readBody } from 'h3'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import postSongScores, {
  ScoreListBody,
} from '~~/server/api/v1/scores/[id]/index.post'
import { getLoginUserInfo } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'
import { createEvent } from '~~/test/test-utils-server'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~~/server/utils/auth')
vi.mock('~~/server/utils/http')

describe('POST /api/v1/scores/[id]', () => {
  const song = {
    id: testSongData.id,
    name: testSongData.name,
    ...testSongData.charts[0],
  }
  const mockedContainer = { items: { batch: vi.fn() } }
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getContainer).mockReturnValue(mockedContainer as any)
  })
  beforeEach(() => {
    vi.mocked(readBody).mockClear()
    vi.mocked(fetchList).mockClear()
    vi.mocked(fetchOne).mockClear()
    vi.mocked(sendNullWithError).mockClear()
    mockedContainer.items.batch.mockClear()
  })

  const scores = new Map(testScores.map(d => [d.userId, d]))
  const score: ScoreListBody = {
    playStyle: 1,
    difficulty: 0,
    score: 1000000,
    clearLamp: 7,
    maxCombo: 138,
    rank: 'AAA',
    exScore: 414,
  }
  const dbScores = testScores.map(d => ({ ...d, id: `${d.userId}-old` }))

  test.each(['', '0'])('(id: "%s") returns 404', async id => {
    // Arrange
    const event = createEvent({ id })

    // Act
    const userScores = await postSongScores(event)

    // Assert
    expect(userScores).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
    expect(vi.mocked(readBody)).not.toBeCalled()
    expect(vi.mocked(getLoginUserInfo)).not.toBeCalled()
    expect(vi.mocked(fetchOne)).not.toBeCalled()
  })

  test.each(['', [], ['foo']])('(body: %o) returns 400', async body => {
    // Arrange
    vi.mocked(readBody).mockResolvedValue(body)
    const event = createEvent({ id: testSongData.id })

    // Act
    const userScores = await postSongScores(event)

    // Assert
    expect(userScores).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(
      event,
      400,
      'body is not Score[]'
    )
    expect(vi.mocked(getLoginUserInfo)).not.toBeCalled()
    expect(vi.mocked(fetchOne)).not.toBeCalled()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('(user: <anonymous>) returns 401', async () => {
    // Arrange
    vi.mocked(readBody).mockResolvedValue([
      { ...score, playStyle: 1, difficulty: 0 },
    ])
    vi.mocked(getLoginUserInfo).mockResolvedValue(null)
    const event = createEvent({ id: testSongData.id })

    // Act
    const userScores = await postSongScores(event)

    // Assert
    expect(userScores).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 401)
    expect(vi.mocked(fetchOne)).not.toBeCalled()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('(id: <not exist song id>) returns 404', async () => {
    // Arrange
    vi.mocked(readBody).mockResolvedValue([
      { ...score, playStyle: 1, difficulty: 0 },
    ])
    vi.mocked(getLoginUserInfo).mockResolvedValue(publicUser)
    vi.mocked(fetchOne).mockResolvedValue(null)
    const event = createEvent({ id: testSongData.id })

    // Act
    const userScores = await postSongScores(event)

    // Assert
    expect(userScores).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test.each([
    [2, 0],
    [1, 4],
  ])(
    '(body: [{ ...scores, playStyle: %i, difficulty: %i }]) returns 404',
    async (playStyle, difficulty) => {
      // Arrange
      vi.mocked(readBody).mockResolvedValue([
        { ...score, playStyle, difficulty },
      ])
      vi.mocked(getLoginUserInfo).mockResolvedValue(publicUser)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchOne).mockResolvedValue(testSongData as any)
      vi.mocked(fetchList).mockResolvedValue([])
      const event = createEvent({ id: testSongData.id })

      // Act
      const userScores = await postSongScores(event)

      // Assert
      expect(userScores).toBeNull()
      expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
    }
  )

  test.each([
    { ...score, exScore: 1000 },
    {
      playStyle: 1,
      difficulty: 0,
      score: 90000,
      clearLamp: 2,
      rank: 'E',
      exScore: 1000,
    },
  ])('(body: [%o]) returns 400', async score => {
    // Arrange
    vi.mocked(readBody).mockResolvedValue([score])
    vi.mocked(getLoginUserInfo).mockResolvedValue(publicUser)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(testSongData as any)
    vi.mocked(fetchList).mockResolvedValue([])
    const event = createEvent({ id: testSongData.id })

    // Act
    const userScores = await postSongScores(event)

    // Assert
    expect(userScores).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(
      event,
      400,
      'body[0] is invalid Score'
    )
  })

  test('(user: publicUser, body: [<new score>]) inserts world & area top', async () => {
    // Arrange
    const score = {
      playStyle: 1,
      difficulty: 1,
      score: 999700,
      clearLamp: 6,
      rank: 'AAA',
      maxCombo: 264,
      exScore: 762,
    } as const
    vi.mocked(readBody).mockResolvedValue([score])
    vi.mocked(getLoginUserInfo).mockResolvedValue(publicUser)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(testSongData as any)
    vi.mocked(fetchList).mockResolvedValue([])
    const event = createEvent({ id: testSongData.id })

    // Act
    const userScores = await postSongScores(event)

    // Assert
    expect(userScores).toStrictEqual([
      {
        ...scores.get(publicUser.id),
        ...score,
        level: testSongData.charts[1].level,
        radar: calcMyGrooveRadar(testSongData.charts[1], score),
      },
    ])
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(mockedContainer.items.batch.mock.calls[0][0]).toHaveLength(3)
  })

  test.each([
    [
      {
        playStyle: 1,
        difficulty: 0,
        score: 996710,
        clearLamp: 5,
        rank: 'AAA',
        maxCombo: 138,
        exScore: 374,
      } as const,
      2, // user scores(old & new)
    ],
    [
      {
        playStyle: 1,
        difficulty: 0,
        score: 999620,
        clearLamp: 6,
        rank: 'AAA',
        exScore: 376,
        maxCombo: 138,
      } as const,
      4, // user scores and area top scores(old & new)
    ],
  ])('(user: publicUser, body: [%o]) calls %i batch', async (score, length) => {
    // Arrange
    vi.mocked(readBody).mockResolvedValue([score])
    vi.mocked(getLoginUserInfo).mockResolvedValue(publicUser)
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(fetchOne).mockResolvedValue(testSongData as any)
    vi.mocked(fetchList).mockResolvedValue(dbScores as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const event = createEvent({ id: testSongData.id })

    // Act
    const userScores = await postSongScores(event)

    // Assert
    expect(userScores).toStrictEqual([
      {
        ...scores.get(publicUser.id),
        ...score,
        radar: calcMyGrooveRadar(testSongData.charts[0], score),
      },
    ])
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(mockedContainer.items.batch.mock.calls[0][0]).toHaveLength(length)
  })

  test.each([
    [privateUser, 2], // privateUser scores(old & new)
    [areaHiddenUser, 4], // areaHiddenUser scores and world top scores(old & new)
    [publicUser, 6], // publicUser scores, area top scores, and world top scores(old & new)
  ])('(user: %o, body: [<MFC score>]) calls %i batch', async (user, length) => {
    // Arrange
    vi.mocked(readBody).mockResolvedValue([score])
    vi.mocked(getLoginUserInfo).mockResolvedValue(user)
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(fetchOne).mockResolvedValue(testSongData as any)
    vi.mocked(fetchList).mockResolvedValue(dbScores as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const event = createEvent({ id: testSongData.id })

    // Act
    const userScores = await postSongScores(event)

    // Assert
    expect(userScores).toStrictEqual([
      {
        ...score,
        userId: user.id,
        userName: user.name,
        isPublic: user.isPublic,
        songId: song.id,
        songName: song.name,
        level: song.level,
        radar: calcMyGrooveRadar(song, score),
      },
    ])
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(mockedContainer.items.batch.mock.calls[0][0]).toHaveLength(length)
  })

  test('(user: privateUser, body: [{ topScore: 1000000 }]) inserts world top', async () => {
    // Arrange
    const score = {
      playStyle: 1,
      difficulty: 0,
      score: 800000,
      clearLamp: 0,
      rank: 'E',
      topScore: 1000000,
    } as const
    vi.mocked(readBody).mockResolvedValue([score])
    vi.mocked(getLoginUserInfo).mockResolvedValue(privateUser)
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(fetchOne).mockResolvedValue(testSongData as any)
    vi.mocked(fetchList).mockResolvedValue(dbScores as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const event = createEvent({ id: testSongData.id })

    // Act
    const userScores = await postSongScores(event)

    // Assert
    expect(userScores).toHaveLength(0)
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(mockedContainer.items.batch.mock.calls[0][0]).toHaveLength(2)
  })
})
