// @vitest-environment node
import { queryContainer } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { testSongData } from '~~/../core/test/data'
import handler from '~~/server/api/v1/songs/[id].get'
import { createEvent } from '~~/server/test/utils'

vi.mock('@ddradar/db')

describe('GET /api/v1/songs/[id]', () => {
  beforeEach(() => {
    vi.mocked(queryContainer).mockClear()
  })

  test(`/${testSongData.id} (exist song) returns SongInfo`, async () => {
    // Arrange
    vi.mocked(queryContainer).mockReturnValue({
      fetchNext: vi.fn().mockResolvedValue({ resources: [testSongData] }),
    } as unknown as ReturnType<typeof queryContainer>)
    const event = createEvent({ id: testSongData.id })

    // Act
    const song = await handler(event)

    // Assert
    expect(song).toBe(testSongData)
  })
  test(`/00000000000000000000000000000000 (not exist song) returns 404`, async () => {
    // Arrange
    vi.mocked(queryContainer).mockReturnValue({
      fetchNext: vi.fn().mockResolvedValue({ resources: [] }),
    } as unknown as ReturnType<typeof queryContainer>)
    const event = createEvent({ id: `00000000000000000000000000000000` })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked(queryContainer)).toBeCalled()
  })

  test(`/invalid-id returns 400`, async () => {
    // Arrange
    vi.mocked(queryContainer).mockReturnValue({
      fetchNext: vi.fn().mockResolvedValue({ resources: [] }),
    } as unknown as ReturnType<typeof queryContainer>)
    const event = createEvent({ id: 'invalid-id' })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked(queryContainer)).not.toBeCalled()
  })
})
