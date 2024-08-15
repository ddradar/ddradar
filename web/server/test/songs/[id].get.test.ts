// @vitest-environment node
import { testSongData } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/songs/[id].get'
import { createEvent } from '~~/server/test/utils'

describe('GET /api/v2/songs/[id]', () => {
  beforeEach(() => {
    vi.mocked(getSongRepository).mockClear()
  })

  test(`/${testSongData.id} (exist song) returns SongInfo`, async () => {
    // Arrange
    const get = vi.fn().mockResolvedValue(testSongData)
    vi.mocked(getSongRepository).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getSongRepository>)
    const event = createEvent({ id: testSongData.id })

    // Act
    const song = await handler(event)

    // Assert
    expect(song).toBe(testSongData)
    expect(get).toBeCalledWith(testSongData.id)
  })
  test(`/00000000000000000000000000000000 (not exist song) returns 404`, async () => {
    // Arrange
    vi.mocked(getSongRepository).mockReturnValue({
      get: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof getSongRepository>)
    const event = createEvent({ id: `00000000000000000000000000000000` })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 404 })
    )
    expect(vi.mocked(getSongRepository)).toBeCalled()
  })
  test(`/invalid-id returns 400`, async () => {
    // Arrange
    vi.mocked(getSongRepository).mockReturnValue({
      get: vi.fn().mockResolvedValue(testSongData),
    } as unknown as ReturnType<typeof getSongRepository>)
    const event = createEvent({ id: 'invalid-id' })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(getSongRepository)).not.toBeCalled()
  })
})
