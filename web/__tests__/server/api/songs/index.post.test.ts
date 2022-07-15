import { testSongData } from '@ddradar/core/__tests__/data'
import { getContainer } from '@ddradar/db'
import { useBody } from 'h3'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import postSongInfo from '~/server/api/v1/songs/index.post'
import { sendNullWithError } from '~/server/utils'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~/server/utils')

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
    vi.mocked(sendNullWithError).mockReturnValue(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getContainer).mockReturnValue(mockedContainer as any)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
    mockedContainer.items.upsert.mockClear()
  })

  test('returns "400 Bad Request" if body is empty', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(useBody).mockResolvedValue(null)

    // Act
    const song = await postSongInfo(event)

    // Assert
    expect(song).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(
      event,
      400,
      'Invalid Body'
    )
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
  ])('(body: %o) returns "200 OK" with %o', async (body, expected) => {
    // Arrange
    const event = createEvent()
    vi.mocked(useBody).mockResolvedValue(body)

    // Act
    const result = await postSongInfo(event)

    // Assert
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(result).toStrictEqual(expected)
    expect(mockedContainer.items.upsert).toBeCalledWith(expected)
  })
})
