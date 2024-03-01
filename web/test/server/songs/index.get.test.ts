// @vitest-environment node
import { fetchList } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { testSongList } from '~/../core/test/data'
import searchSongs from '~~/server/api/v1/songs/index.get'
import { createEvent } from '~~/test/test-utils-server'

vi.mock('@ddradar/db')

describe('GET /api/v1/songs', () => {
  beforeEach(() => {
    vi.mocked(fetchList).mockClear()
  })

  const defaultCond = { condition: 'c.nameIndex >= 0' }
  test.each([
    [undefined, undefined, []],
    ['-1', '-1', []],
    ['0.5', '0.5', []],
    ['100', '100', []],
    ['25', undefined, [{ condition: 'c.nameIndex = @', value: 25 }]],
    [undefined, '10', [{ condition: 'c.series = @', value: 'DDR X' }]],
    [
      '25',
      '0',
      [
        { condition: 'c.nameIndex = @', value: 25 },
        { condition: 'c.series = @', value: 'DDR 1st' },
      ],
    ],
  ])(
    '?name=%s&series=%s calls fetchList(..., ..., %o)',
    async (name, series, expected) => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchList).mockResolvedValue([...testSongList] as any)
      const event = createEvent(undefined, { name, series })

      // Act
      const songs = await searchSongs(event)

      // Assert
      expect(songs).not.toHaveLength(0)
      const conditions = vi.mocked(fetchList).mock.calls[0][2]
      expect(conditions).toStrictEqual([defaultCond, ...expected])
    }
  )
})
