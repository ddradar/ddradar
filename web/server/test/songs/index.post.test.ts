// @vitest-environment node
import { testSongData } from '@ddradar/core/test/data'
import { getContainer } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import postSongInfo from '~~/server/api/v1/songs/index.post'
import { createEvent } from '~~/server/test/utils'

vi.mock('@ddradar/db')

describe('POST /api/v1/songs', () => {
  const validSong: typeof testSongData = {
    ...testSongData,
    charts: [
      ...testSongData.charts,
      {
        ...testSongData.charts[1],
        playStyle: 2,
      },
    ],
  }
  const mockedContainer = { items: { upsert: vi.fn() } }
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getContainer).mockReturnValue(mockedContainer as any)
  })
  beforeEach(() => {
    mockedContainer.items.upsert.mockClear()
  })

  test('returns 400 if body is empty', async () => {
    // Arrange
    const event = createEvent(undefined, undefined, null)

    // Act - Assert
    await expect(postSongInfo(event)).rejects.toThrowError()
  })

  const inversedCharts = [...validSong.charts].sort(
    (l, r) => l.difficulty - r.difficulty
  )
  const deleted = { ...validSong, deleted: true }
  test.each([
    [validSong, validSong],
    [{ ...validSong, charts: inversedCharts }, validSong],
    [{ ...validSong, foo: 'bar' }, validSong],
    [{ ...validSong }, validSong],
    [deleted, deleted],
    [{ ...deleted, foo: 'bar' }, deleted],
  ])('(body: %o) returns 200 with %o', async (body, expected) => {
    // Arrange
    const event = createEvent(undefined, undefined, body)

    // Act
    const result = await postSongInfo(event)

    // Assert
    expect(result).toStrictEqual(expected)
    expect(mockedContainer.items.upsert).toBeCalledWith(expected)
  })
})
