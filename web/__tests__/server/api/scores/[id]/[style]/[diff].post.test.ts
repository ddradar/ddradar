import {
  areaHiddenUser,
  privateUser,
  publicUser,
  testScores,
  testSongData,
} from '@ddradar/core/__tests__/data'
import { fetchJoinedList, fetchList, getContainer } from '@ddradar/db'
import { readBody } from 'h3'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import postChartScore from '~/server/api/v1/scores/[id]/[style]/[diff].post'
import { calcMyGrooveRadar } from '~~/../core/src/score'
import { getLoginUserInfo } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~~/server/utils/auth')
vi.mock('~~/server/utils/http')

describe('POST /api/v1/scores/[id]/[style]/[diff]', () => {
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
    vi.mocked(fetchJoinedList).mockClear()
    vi.mocked(sendNullWithError).mockClear()
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

    // Act
    const userScore = await postChartScore(event)

    // Assert
    expect(userScore).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
    expect(vi.mocked(readBody)).not.toBeCalled()
    expect(vi.mocked(getLoginUserInfo)).not.toBeCalled()
    expect(vi.mocked(fetchJoinedList)).not.toBeCalled()
  })

  test('returns 400 if body is not Score', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(null)
    vi.mocked(readBody).mockResolvedValue({})
    const event = createEvent(params)

    // Act
    const userScore = await postChartScore(event)

    // Assert
    expect(userScore).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(
      event,
      400,
      'body is not Score'
    )
    expect(vi.mocked(getLoginUserInfo)).not.toBeCalled()
    expect(vi.mocked(fetchJoinedList)).not.toBeCalled()
  })

  test('returns 401 if anonymous', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(null)
    vi.mocked(readBody).mockResolvedValue(mfcScore)
    const event = createEvent(params)

    // Act
    const score = await postChartScore(event)

    // Assert
    expect(score).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 401)
    expect(vi.mocked(fetchJoinedList)).not.toBeCalled()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('returns 404 if not found SongChart data', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(publicUser)
    vi.mocked(readBody).mockResolvedValue(mfcScore)
    vi.mocked(fetchJoinedList).mockResolvedValue([])
    const event = createEvent(params)

    // Act
    const score = await postChartScore(event)

    // Assert
    expect(score).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  test('returns 400 if body is invalid Score', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(publicUser)
    vi.mocked(readBody).mockResolvedValue({
      score: 90000,
      clearLamp: 2,
      rank: 'E',
      exScore: 1000,
    })
    vi.mocked(fetchJoinedList).mockResolvedValue([song])
    const event = createEvent(params)

    // Act
    const score = await postChartScore(event)

    // Assert
    expect(score).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(
      event,
      400,
      'body is invalid Score'
    )
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('(user: { isPublic: true, area: 13 }, score: <new score>) inserts world & area top', async () => {
    // Arrange
    const body = { score: 900000, clearLamp: 3, rank: 'AA' } as const
    vi.mocked(getLoginUserInfo).mockResolvedValue(publicUser)
    vi.mocked(readBody).mockResolvedValue(body)
    vi.mocked(fetchJoinedList).mockResolvedValue([song])
    vi.mocked(fetchList).mockResolvedValue([])
    const event = createEvent(params)

    // Act
    const score = await postChartScore(event)

    // Assert
    const radar = calcMyGrooveRadar(song, body)
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
      radar,
    })
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
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
      vi.mocked(readBody).mockResolvedValue(body)
      vi.mocked(fetchJoinedList).mockResolvedValue([song])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchList).mockResolvedValue(dbScores as any)
      const event = createEvent(params)

      // Act
      const score = await postChartScore(event)

      // Assert
      const radar = calcMyGrooveRadar(song, body)
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
        radar,
      })
      expect(vi.mocked(sendNullWithError)).not.toBeCalled()
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
    vi.mocked(readBody).mockResolvedValue(mfcScore)
    vi.mocked(fetchJoinedList).mockResolvedValue([song])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchList).mockResolvedValue(dbScores as any)
    const event = createEvent(params)

    // Act
    const score = await postChartScore(event)

    // Assert
    const radar = calcMyGrooveRadar(song, mfcScore)
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
      radar,
    })
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(mockedContainer.items.batch.mock.calls[0][0]).toHaveLength(length)
  })
})
