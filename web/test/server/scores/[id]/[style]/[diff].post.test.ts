// @vitest-environment node
import { fetchJoinedList, fetchList, getContainer } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  areaHiddenUser,
  privateUser,
  publicUser,
  testScores,
  testSongData,
} from '~/../core/test/data'
import handler from '~/server/api/v1/scores/[id]/[style]/[diff].post'
import { getLoginUserInfo } from '~/server/utils/auth'
import { createEvent } from '~/test/test-utils-server'

vi.mock('@ddradar/db')
vi.mock('~/server/utils/auth')

describe('POST /api/v1/scores/[id]/[style]/[diff]', () => {
  const song = {
    id: testSongData.id,
    name: testSongData.name,
    ...testSongData.charts[0],
  }
  const mockedContainer = { items: { batch: vi.fn() } }
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getContainer).mockReturnValue(mockedContainer as any)
  })
  beforeEach(() => {
    vi.mocked(fetchList).mockClear()
    vi.mocked(fetchJoinedList).mockClear()
    mockedContainer.items.batch.mockClear()
  })
  const score = testScores[0]
  const params = {
    id: score.songId,
    style: `${score.playStyle}`,
    diff: `${score.difficulty}`,
  }
  const dbScores = testScores.map(d => ({ ...d, id: `${d.userId}-old` }))
  const mfcScore = { score: 1000000, rank: 'AAA', clearLamp: 7 } as const

  test.each([
    { id: '', style: '', diff: '' },
    { ...params, id: '0' },
    { ...params, style: '3' },
    { ...params, diff: '-1' },
  ])('%o returns 404', async params => {
    // Arrange
    const event = createEvent(params)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked(getLoginUserInfo)).not.toBeCalled()
    expect(vi.mocked(fetchJoinedList)).not.toBeCalled()
  })

  test('returns 400 if body is not Score', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(null)
    const event = createEvent(params, undefined, {})

    // Act
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked(getLoginUserInfo)).not.toBeCalled()
    expect(vi.mocked(fetchJoinedList)).not.toBeCalled()
  })

  test('returns 401 if anonymous', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(null)
    const event = createEvent(params, undefined, mfcScore)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      createError({ statusCode: 401 })
    )
    expect(vi.mocked(fetchJoinedList)).not.toBeCalled()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('returns 404 if not found SongChart data', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(publicUser)
    vi.mocked(fetchJoinedList).mockResolvedValue([])
    const event = createEvent(params, undefined, mfcScore)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      createError({ statusCode: 404 })
    )
    expect(vi.mocked(fetchJoinedList)).toBeCalled()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('returns 400 if body is invalid Score', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(publicUser)
    vi.mocked(fetchJoinedList).mockResolvedValue([song])
    const event = createEvent(params, undefined, {
      score: 90000,
      clearLamp: 2,
      rank: 'E',
      exScore: 1000,
    })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      createError({ statusCode: 400, message: 'body is invalid Score' })
    )
    expect(vi.mocked(fetchJoinedList)).toBeCalled()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('(user: { isPublic: true, area: 13 }, score: <new score>) inserts world & area top', async () => {
    // Arrange
    const body = { score: 900000, clearLamp: 3, rank: 'AA' } as const
    vi.mocked(getLoginUserInfo).mockResolvedValue(publicUser)
    vi.mocked(fetchJoinedList).mockResolvedValue([song])
    vi.mocked(fetchList).mockResolvedValue([])
    const event = createEvent(params, undefined, body)

    // Act
    const score = await handler(event)

    // Assert
    expect(score).toStrictEqual({
      ...body,
      userId: publicUser.id,
      userName: publicUser.name,
      isPublic: publicUser.isPublic,
      songId: song.id,
      songName: song.name,
      playStyle: song.playStyle,
      difficulty: song.difficulty,
      level: song.level,
    })
    expect(mockedContainer.items.batch.mock.calls[0][0]).toHaveLength(3)
  })

  test.each([
    [
      {
        score: 890000,
        clearLamp: 4,
        rank: 'AA-',
        exScore: 200,
        maxCombo: 138,
      } as const,
      2, // user scores(old & new)
    ],
    [
      {
        score: 999620,
        clearLamp: 6,
        rank: 'AAA',
        exScore: 376,
        maxCombo: 138,
      } as const,
      4, // user scores and area top scores(old & new)
    ],
  ])(
    '(user: { isPublic: true, area: 13 }, score: %o) calls %i batch',
    async (body, length) => {
      // Arrange
      vi.mocked(getLoginUserInfo).mockResolvedValue(publicUser)
      vi.mocked(fetchJoinedList).mockResolvedValue([song])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchList).mockResolvedValue(dbScores as any)
      const event = createEvent(params, undefined, body)

      // Act
      const score = await handler(event)

      // Assert
      expect(score).toStrictEqual({
        ...body,
        userId: publicUser.id,
        userName: publicUser.name,
        isPublic: publicUser.isPublic,
        songId: song.id,
        songName: song.name,
        playStyle: song.playStyle,
        difficulty: song.difficulty,
        level: song.level,
      })
      expect(mockedContainer.items.batch.mock.calls[0][0]).toHaveLength(length)
    }
  )

  test.each([
    [privateUser, 2], // privateUser scores(old & new)
    [areaHiddenUser, 4], // areaHiddenUser scores and world top scores(old & new)
    [publicUser, 6], // publicUser scores, area top scores, and world top scores(old & new)
  ])('(user: %o, score: <MFC score>) calls %i batch', async (user, length) => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(user)
    vi.mocked(fetchJoinedList).mockResolvedValue([song])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchList).mockResolvedValue(dbScores as any)
    const event = createEvent(params, undefined, mfcScore)

    // Act
    const score = await handler(event)

    // Assert
    expect(score).toStrictEqual({
      ...mfcScore,
      exScore: (song.notes + song.freezeArrow + song.shockArrow) * 3,
      maxCombo: song.notes + song.shockArrow,
      userId: user.id,
      userName: user.name,
      isPublic: user.isPublic,
      songId: song.id,
      songName: song.name,
      playStyle: song.playStyle,
      difficulty: song.difficulty,
      level: song.level,
    })
    expect(mockedContainer.items.batch.mock.calls[0][0]).toHaveLength(length)
  })
})
