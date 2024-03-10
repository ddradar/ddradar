// @vitest-environment node
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { testCourseData, testSongData } from '~/../core/test/data'
import handler from '~/server/api/v1/songs/[id].get'
import { createEvent } from '~/test/test-utils-server'

describe('GET /api/v1/songs/[id]', () => {
  beforeEach(() => {
    vi.mocked($graphql).mockClear()
  })

  test(`/${testSongData.id} (exist song) returns SongInfo`, async () => {
    // Arrange
    vi.mocked($graphql).mockResolvedValue({ song_by_pk: testSongData })
    const event = createEvent({ id: testSongData.id })

    // Act
    const song = await handler(event)

    // Assert
    expect(song).toBe(testSongData)
  })
  test(`/00000000000000000000000000000000 (not exist song) returns 404`, async () => {
    // Arrange
    vi.mocked($graphql).mockResolvedValue({ song_by_pk: null })
    const event = createEvent({ id: `00000000000000000000000000000000` })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked($graphql)).toBeCalled()
  })

  test(`/${testCourseData.id} (course data) returns 404`, async () => {
    // Arrange
    vi.mocked($graphql).mockResolvedValue({ song_by_pk: testCourseData })
    const event = createEvent({ id: testCourseData.id })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked($graphql)).toBeCalled()
  })

  test(`/invalid-id returns 400`, async () => {
    // Arrange
    vi.mocked($graphql).mockResolvedValue({ song_by_pk: null })
    const event = createEvent({ id: 'invalid-id' })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked($graphql)).not.toBeCalled()
  })
})
