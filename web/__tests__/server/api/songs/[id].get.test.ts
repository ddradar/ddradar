import { testSongData } from '@ddradar/core/__tests__/data'
import { fetchOne } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import getSongInfo from '~/server/api/v1/songs/[id].get'
import { sendNullWithError } from '~~/server/utils/http'

vi.mock('@ddradar/db')
vi.mock('~~/server/utils/http')

describe('GET /api/v1/songs/[id]', () => {
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
  })

  test(`/${testSongData.id} (exist song) returns SongInfo`, async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(testSongData as any)
    const event = createEvent({ id: testSongData.id })

    // Act
    const song = await getSongInfo(event)

    // Assert
    expect(song).toBe(testSongData)
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
  })

  test(`/00000000000000000000000000000000 (not exist song) returns 404`, async () => {
    // Arrange
    vi.mocked(fetchOne).mockResolvedValue(null)
    const event = createEvent({ id: `00000000000000000000000000000000` })

    // Act
    const song = await getSongInfo(event)

    // Assert
    expect(song).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  test(`/invalid-id returns 400`, async () => {
    // Arrange
    vi.mocked(fetchOne).mockResolvedValue(null)
    const event = createEvent({ id: 'invalid-id' })

    // Act
    const song = await getSongInfo(event)

    // Assert
    expect(song).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 400)
  })
})
