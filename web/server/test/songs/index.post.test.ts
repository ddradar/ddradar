// @vitest-environment node
import { testSongData } from '@ddradar/core/test/data'
import type { DBSongSchema } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/songs/index.post'
import { createEvent } from '~~/server/test/utils'

describe('POST /api/v2/songs', () => {
  const song: Omit<DBSongSchema, 'type'> = {
    id: testSongData.id,
    name: testSongData.name,
    nameKana: testSongData.nameKana,
    artist: testSongData.artist,
    series: testSongData.series,
    minBPM: testSongData.minBPM,
    maxBPM: testSongData.maxBPM,
    folders: [],
    charts: [
      ...testSongData.charts,
      {
        ...testSongData.charts[1],
        playStyle: 2,
      },
    ],
  }
  beforeEach(() => {
    vi.mocked(getSongRepository).mockClear()
  })

  test('throws 401 Error when user does not have "administrator" role', async () => {
    // Arrange
    vi.mocked(hasRole).mockReturnValueOnce(false)
    const event = createEvent(undefined, undefined, null)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 401 })
    )
    expect(vi.mocked(getSongRepository)).not.toBeCalled()
  })
  test('throws 400 Error when body is empty', async () => {
    // Arrange
    vi.mocked(hasRole).mockReturnValueOnce(true)
    const event = createEvent(undefined, undefined, null)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(getSongRepository)).not.toBeCalled()
  })

  const inversedCharts = [...song.charts].sort(
    (l, r) => l.difficulty - r.difficulty
  )
  test.each([
    [song, { ...song, type: 'song' }],
    [
      { ...song, charts: inversedCharts },
      { ...song, type: 'song' },
    ],
    [
      { ...song, foo: 'bar' },
      { ...song, type: 'song' },
    ],
    [
      { ...song, deleted: true },
      { ...song, type: 'song', deleted: true },
    ],
  ])('(body: %o) returns 200 with %o', async (body, expected) => {
    // Arrange
    const upsert = vi.fn()
    vi.mocked(hasRole).mockReturnValueOnce(true)
    vi.mocked(getSongRepository).mockReturnValueOnce({
      upsert,
    } as unknown as ReturnType<typeof getSongRepository>)
    const event = createEvent(undefined, undefined, body)

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toStrictEqual(expected)
    expect(upsert).toBeCalledWith(expected)
  })
})
