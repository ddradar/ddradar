import { testSongData } from '@ddradar/core/__tests__/data'
import { getContainer } from '@ddradar/db'
import { createError, sendError, useBody } from 'h3'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import postSongInfo from '~/server/api/v1/songs/index.post'

import { createEvent } from '../../test-util'

vi.mock('@ddradar/db')
vi.mock('h3')

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
    vi.mocked(createError).mockClear()
    vi.mocked(sendError).mockClear()
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
    expect(vi.mocked(sendError)).toBeCalled()
    expect(vi.mocked(createError)).toBeCalledWith({
      statusCode: 400,
      message: 'Invalid Body',
    })
  })

  test.each([
    validSong,
    {
      ...validSong,
      charts: [...validSong.charts].sort((l, r) => l.difficulty - r.difficulty),
    },
    { ...validSong, foo: 'bar' },
    { ...validSong },
  ])('returns "200 OK" with JSON body if body is %p', async body => {
    // Arrange
    const event = createEvent()
    vi.mocked(useBody).mockResolvedValue(body)

    // Act
    const result = await postSongInfo(event)

    // Assert
    expect(vi.mocked(sendError)).not.toBeCalled()
    expect(result).toStrictEqual(validSong)
    expect(mockedContainer.items.upsert).toBeCalledWith(validSong)
  })

  test.each([
    {
      ...validSong,
      charts: [...validSong.charts].sort((l, r) => l.difficulty - r.difficulty),
      deleted: true,
    },
    { ...validSong, foo: 'bar', deleted: true },
    { ...validSong, deleted: true },
  ])('returns "200 OK" with JSON body if body is %p', async body => {
    // Arrange
    const event = createEvent()
    vi.mocked(useBody).mockResolvedValue(body)

    // Act
    const result = await postSongInfo(event)

    // Assert
    expect(vi.mocked(sendError)).not.toBeCalled()
    const expected = { ...validSong, deleted: true }
    expect(result).toStrictEqual(expected)
    expect(mockedContainer.items.upsert).toBeCalledWith(expected)
  })
})
