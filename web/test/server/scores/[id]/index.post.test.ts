// @vitest-environment node
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
import { upsertScore } from '~~/server/utils/score'
import { createEvent } from '~~/test/test-utils-server'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~~/server/utils/auth')
vi.mock('~~/server/utils/http')
vi.mock('~~/server/utils/score')

describe('POST /api/v1/scores/[id]', () => {
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
    vi.mocked(upsertScore).mockClear()
  })

  /** MFC score */
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

  test.each([
    [privateUser, 1], // personal
    [areaHiddenUser, 2], // personal, world
    [publicUser, 3], // personal, area, world
  ])(
    '(user: %o, body: [<MFC score>]) calls upsertScore() %i time(s)',
    async (user, times) => {
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
      expect(userScores).not.toBeNull()
      expect(vi.mocked(upsertScore)).toBeCalledTimes(times)
      expect(vi.mocked(sendNullWithError)).not.toBeCalled()
      expect(mockedContainer.items.batch).toBeCalled()
    }
  )

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
    expect(userScores).not.toBeNull()
    expect(vi.mocked(upsertScore)).toBeCalledTimes(2)
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(mockedContainer.items.batch).toBeCalled()
  })
})
