import { testSongList } from '@ddradar/core/__tests__/data'
import { fetchList } from '@ddradar/db'
import { useQuery } from 'h3'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import searchSongs from '~/server/api/v1/songs.get'

import { createEvent } from '../test-util'

vi.mock('@ddradar/db')
vi.mock('h3')

describe('GET /api/v1/songs', () => {
  let query: Record<string, string | string[]> = {}
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchList).mockResolvedValue([...testSongList] as any)
  })
  beforeEach(() => {
    query = {}
    vi.mocked(fetchList).mockClear()
  })

  const defaultCond = { condition: 'c.nameIndex >= 0' }
  test.each([
    ['', '', []],
    ['-1', '-1', []],
    ['0.5', '0.5', []],
    ['25', '', [{ condition: 'c.nameIndex = @', value: 25 }]],
    ['', '10', [{ condition: 'c.series = @', value: 'DDR X' }]],
    [
      ['25'],
      '0',
      [
        { condition: 'c.nameIndex = @', value: 25 },
        { condition: 'c.series = @', value: 'DDR 1st' },
      ],
    ],
  ])(
    '?name=%s&series=%s calls fetchList(..., ..., %p)',
    async (name, series, expected) => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchList).mockResolvedValue([...testSongList] as any)
      if (name) query.name = name
      if (series) query.series = series
      vi.mocked(useQuery).mockReturnValue(query)
      const event = createEvent()

      // Act
      const songs = await searchSongs(event)

      // Assert
      expect(event.res.statusCode).toBe(200)
      expect(songs).not.toHaveLength(0)
      const conditions = vi.mocked(fetchList).mock.calls[0][2]
      expect(conditions).toStrictEqual([defaultCond, ...expected])
    }
  )

  test('returns 404 Not Found if fetchList(...) returns empty', async () => {
    // Arrange
    vi.mocked(fetchList).mockResolvedValue([])
    const event = createEvent()

    // Act
    const songs = await searchSongs(event)

    // Assert
    expect(event.res.statusCode).toBe(404)
    expect(songs).toHaveLength(0)
  })
})
