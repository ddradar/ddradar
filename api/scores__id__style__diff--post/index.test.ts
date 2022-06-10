import type { Context, HttpRequest } from '@azure/functions'
import type { Database } from '@ddradar/core'
import {
  areaHiddenUser,
  privateUser,
  publicUser,
  testCourseData as course,
  testScores,
  testSongData as song,
} from '@ddradar/core/__tests__/data'
import { beforeEach, describe, expect, jest, test } from '@jest/globals'

import { getLoginUserInfo } from '../auth'
import postChartScore from '.'

jest.mock('../auth')

describe('POST /api/v1/scores/{id}/{style}/{diff}', () => {
  let context: Pick<Context, 'bindingData'>
  let req: Pick<HttpRequest, 'headers' | 'body'>
  const mfcScore = { score: 1000000, rank: 'AAA', clearLamp: 7 }
  const radar = { stream: 29, voltage: 22, air: 5, freeze: 0, chaos: 0 }

  beforeEach(() => {
    context = { bindingData: {} }
    req = { headers: {} }
  })

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    jest.mocked(getLoginUserInfo).mockResolvedValueOnce(null)
    context.bindingData.id = '00000000000000000000000000000000'
    context.bindingData.style = 1
    context.bindingData.diff = 0
    req.body = mfcScore

    // Act
    const result = await postChartScore(context, req, [], [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test('returns "400 Bad Request" if body is not Score', async () => {
    // Arrange
    jest.mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    context.bindingData.id = '00000000000000000000000000000000'
    context.bindingData.style = 1
    context.bindingData.diff = 0
    req.body = {}

    // Act
    const result = await postChartScore(context, req, [], [])

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test('returns "404 Not Found" if songs is empty', async () => {
    // Arrange
    jest.mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    context.bindingData.id = '00000000000000000000000000000000'
    context.bindingData.style = 1
    context.bindingData.diff = 0
    req.body = mfcScore

    // Act
    const result = await postChartScore(context, req, [], [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test.each([
    [song.id, 2, 0],
    [song.id, 1, 4],
  ])(
    '/%s/%i/%i returns "404 Not Found"',
    async (songId, playStyle, difficulty) => {
      // Arrange
      jest.mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      context.bindingData.id = songId
      context.bindingData.style = playStyle
      context.bindingData.diff = difficulty
      req.body = mfcScore

      // Act
      const result = await postChartScore(context, req, [song], [])

      // Assert
      expect(result.httpResponse.status).toBe(404)
    }
  )

  test('returns "400 Bad Request" if body is invalid Score', async () => {
    // Arrange
    jest.mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    context.bindingData.id = song.id
    context.bindingData.style = song.charts[0].playStyle
    context.bindingData.diff = song.charts[0].difficulty
    req.body = { score: 90000, clearLamp: 2, rank: 'E', exScore: 1000 }

    // Act
    const result = await postChartScore(context, req, [song], [])

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  const score = {
    songId: song.id,
    songName: song.name,
    playStyle: song.charts[0].playStyle,
    difficulty: song.charts[0].difficulty,
    level: song.charts[0].level,
    score: 970630, // P:28, Gr:10
    clearLamp: 5,
    rank: 'AA+',
    maxCombo: 138,
    exScore: 366,
  } as const
  const scores: Database.ScoreSchema[] = [...testScores]

  test(`/${song.id}/1/1 inserts World & Area Top`, async () => {
    // Arrange
    jest.mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    context.bindingData.id = song.id
    context.bindingData.style = song.charts[1].playStyle
    context.bindingData.diff = song.charts[1].difficulty
    req.body = { score: 900000, clearLamp: 3, rank: 'AA' }

    // Act
    const result = await postChartScore(context, req, [song], [])

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual({
      ...req.body,
      userId: publicUser.id,
      userName: publicUser.name,
      isPublic: publicUser.isPublic,
      songId: song.id,
      songName: song.name,
      playStyle: song.charts[1].playStyle,
      difficulty: song.charts[1].difficulty,
      level: song.charts[1].level,
      radar: { stream: 50, voltage: 0, air: 17, freeze: 0, chaos: 3 },
    })
    expect(result.documents).toHaveLength(3)
  })

  test.each([
    [
      2,
      { score: 890000, clearLamp: 4, rank: 'AA-', exScore: 200, maxCombo: 138 },
      { ...radar, stream: 25 },
    ], // user scores(old & new)
    [
      4,
      { score: 999620, clearLamp: 6, rank: 'AAA', exScore: 376, maxCombo: 138 },
      { ...radar, stream: 28 },
    ], // user scores and area top scores(old & new)
  ])(
    `/${song.id}/1/0 returns "200 OK" with JSON and documents[%i] if body is %p`,
    async (length, score, radar) => {
      // Arrange
      jest.mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      context.bindingData.id = song.id
      context.bindingData.style = song.charts[0].playStyle
      context.bindingData.diff = song.charts[0].difficulty
      req.body = score

      // Act
      const result = await postChartScore(context, req, [song], scores)

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual({
        ...scores[2],
        ...score,
        radar,
      })
      expect(result.documents).toHaveLength(length)
    }
  )

  test.each([
    [2, privateUser], // privateUser scores(old & new)
    [4, areaHiddenUser], // areaHiddenUser scores and world top scores(old & new)
    [6, publicUser], // publicUser scores, area top scores, and world top scores(old & new)
  ])(
    `/${song.id}/1/0 returns "200 OK" with JSON and documents[%i] if user is %p`,
    async (length, user) => {
      // Arrange
      jest.mocked(getLoginUserInfo).mockResolvedValueOnce(user)
      context.bindingData.id = song.id
      context.bindingData.style = song.charts[0].playStyle
      context.bindingData.diff = song.charts[0].difficulty
      req.body = mfcScore

      // Act
      const result = await postChartScore(context, req, [song], scores)

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual({
        ...score,
        userId: user.id,
        userName: user.name,
        isPublic: user.isPublic,
        ...mfcScore,
        maxCombo: 138,
        exScore: 414,
        radar,
      })
      expect(result.documents).toHaveLength(length)
    }
  )

  test(`/${course.id}/1/0 returns "200 OK" with JSON and documents if course`, async () => {
    // Arrange
    jest.mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
    context.bindingData.id = course.id
    context.bindingData.style = course.charts[0].playStyle
    context.bindingData.diff = course.charts[0].difficulty
    req.body = mfcScore

    // Act
    const result = await postChartScore(context, req, [course], scores)

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual({
      songId: course.id,
      songName: course.name,
      playStyle: course.charts[0].playStyle,
      difficulty: course.charts[0].difficulty,
      level: course.charts[0].level,
      userId: privateUser.id,
      userName: privateUser.name,
      isPublic: privateUser.isPublic,
      ...mfcScore,
      maxCombo: 438,
      exScore: 1392,
    })
    expect(result.documents).toHaveLength(2)
  })

  test(`/${song.id}/1/0 returns "200 OK" with JSON and documents if deleted song`, async () => {
    // Arrange
    jest.mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
    context.bindingData.id = song.id
    context.bindingData.style = song.charts[0].playStyle
    context.bindingData.diff = song.charts[0].difficulty
    req.body = mfcScore

    // Act
    const result = await postChartScore(
      context,
      req,
      [{ ...song, deleted: true }],
      scores
    )

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual({
      ...score,
      userId: privateUser.id,
      userName: privateUser.name,
      isPublic: privateUser.isPublic,
      ...mfcScore,
      maxCombo: 138,
      exScore: 414,
      radar,
      deleted: true,
    })
    expect(result.documents).toHaveLength(2)
  })
})
