import { testSongData } from '@ddradar/core/__tests__/data'
import { fetchOne } from '@ddradar/db'
import { describe, expect, test, vi } from 'vitest'

import getSongInfo from '~/server/api/v2/songs/[id].get'

import { createEvent } from '../../test-util'

vi.mock('@ddradar/db')

describe('GET /api/v2/songs', () => {
  test(`/${testSongData.id} (exist song) returns SongInfo`, async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(testSongData as any)

    const event = createEvent({ id: testSongData.id })
    const song = await getSongInfo(event)

    expect(event.res.statusCode).toBe(200)
    expect(song).toBe(testSongData)
  })

  test(`/00000000000000000000000000000000 (not exist song) returns 404`, async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(null)

    const event = createEvent({ id: `00000000000000000000000000000000` })
    const song = await getSongInfo(event)

    expect(event.res.statusCode).toBe(404)
    expect(song).toBeNull()
  })

  test(`/ returns 400`, async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(null)

    const event = createEvent({})
    const song = await getSongInfo(event)

    expect(event.res.statusCode).toBe(400)
    expect(song).toBeNull()
  })

  test(`/invalid-id returns 400`, async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(null)

    const event = createEvent({ id: 'invalid-id' })
    const song = await getSongInfo(event)

    expect(event.res.statusCode).toBe(400)
    expect(song).toBeNull()
  })
})
