// @vitest-environment node
import { Lamp, type ScoreRecord } from '@ddradar/core'
import {
  publicUser as user,
  testSongData as song,
} from '@ddradar/core/test/data'
import type { DBScoreSchema } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/scores/[id]/[style]/[diff].post'
import { createEvent } from '~~/server/test/utils'

describe('POST /api/v2/scores/[id]/[style]/[diff]', () => {
  const params = {
    id: song.id,
    style: `${song.charts[0].playStyle}`,
    diff: `${song.charts[0].difficulty}`,
  }
  const mfcScore: ScoreRecord = {
    score: 1000000,
    rank: 'AAA',
    clearLamp: Lamp.MFC,
  }
  beforeEach(() => {
    vi.mocked(getScoreRepository).mockClear()
  })

  test.each([
    { id: '', style: '', diff: '' },
    { ...params, id: '0' },
    { ...params, style: '3' },
    { ...params, diff: '-1' },
  ])('%o (params) throws 404 error', async params => {
    // Arrange
    const event = createEvent(params)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked(getLoginUserInfo)).not.toBeCalled()
    expect(vi.mocked(getScoreRepository)).not.toBeCalled()
  })

  test.each([null, {}])('throws 400 error when body is %o', async body => {
    // Arrange
    const event = createEvent(params, undefined, body)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked(getLoginUserInfo)).not.toBeCalled()
    expect(vi.mocked(getScoreRepository)).not.toBeCalled()
  })

  test('throws 401 error when anonymous', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockRejectedValue({ statusCode: 401 })
    const event = createEvent(params, undefined, mfcScore)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 401 })
    )
    expect(vi.mocked(getScoreRepository)).not.toBeCalled()
  })

  test('throws 404 error when not found Song', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(user)
    const upsert = vi.fn().mockRejectedValue(new Error('Song not found'))
    vi.mocked(getScoreRepository).mockReturnValue({
      upsert,
    } as unknown as ReturnType<typeof getScoreRepository>)
    const event = createEvent(params, undefined, mfcScore)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 404, message: 'Song not found' })
    )
    expect(vi.mocked(upsert)).toBeCalledWith(
      user,
      params.id,
      song.charts[0].playStyle,
      song.charts[0].difficulty,
      mfcScore
    )
  })

  test('throws 400 error when body is invalid Score', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(user)
    const upsert = vi.fn().mockRejectedValue(new Error('Invalid score'))
    vi.mocked(getScoreRepository).mockReturnValue({
      upsert,
    } as unknown as ReturnType<typeof getScoreRepository>)
    const event = createEvent(params, undefined, mfcScore)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 400, message: 'Invalid score' })
    )
    expect(vi.mocked(upsert)).toBeCalledWith(
      user,
      params.id,
      song.charts[0].playStyle,
      song.charts[0].difficulty,
      mfcScore
    )
  })

  test('returns 200 with UserScoreRecord', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(user)
    const upsert = vi.fn().mockResolvedValue({
      id: `${song.id}/${song.charts[0].playStyle}/${song.charts[0].difficulty}/${user.id}`,
      type: 'score',
      user: {
        id: user.id,
        name: user.name,
        isPublic: user.isPublic,
        area: user.area,
      },
      song: {
        id: song.id,
        name: song.name,
        seriesCategory: song.seriesCategory,
        deleted: song.deleted,
      },
      chart: {
        playStyle: song.charts[0].playStyle,
        difficulty: song.charts[0].difficulty,
        level: song.charts[0].level,
      },
      ...mfcScore,
    } satisfies DBScoreSchema)
    vi.mocked(getScoreRepository).mockReturnValue({
      upsert,
    } as unknown as ReturnType<typeof getScoreRepository>)
    const event = createEvent(params, undefined, mfcScore)

    // Act
    const score = await handler(event)

    // Assert
    expect(score).toStrictEqual({
      ...mfcScore,
      exScore: undefined,
      maxCombo: undefined,
      userId: user.id,
      userName: user.name,
      songId: song.id,
      songName: song.name,
      playStyle: song.charts[0].playStyle,
      difficulty: song.charts[0].difficulty,
      level: song.charts[0].level,
    })
    expect(vi.mocked(upsert)).toBeCalledWith(
      user,
      params.id,
      song.charts[0].playStyle,
      song.charts[0].difficulty,
      mfcScore
    )
  })
})
