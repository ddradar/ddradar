// @vitest-environment node
import { testSongList } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/songs/index.get'
import { createEvent } from '~~/server/test/utils'

vi.mock('@ddradar/db')

describe('GET /api/v2/songs', () => {
  beforeEach(() => {
    vi.mocked(getSongRepository).mockClear()
  })

  test.each([
    [undefined, undefined, []],
    ['-1', '-1', []],
    ['0.5', '0.5', []],
    ['100', '100', []],
    ['25', undefined, [{ condition: 'c.cp_nameIndex = @', value: 25 }]],
    [undefined, '10', [{ condition: 'c.series = @', value: 'DDR X' }]],
    [
      '25',
      '0',
      [
        { condition: 'c.cp_nameIndex = @', value: 25 },
        { condition: 'c.series = @', value: 'DDR 1st' },
      ],
    ],
  ])(
    '?name=%s&series=%s calls queryContainer(client, "Songs", query, %o)',
    async (name, series, conditions) => {
      // Arrange
      const list = vi.fn().mockResolvedValue(testSongList)
      vi.mocked(getSongRepository).mockReturnValue({
        list,
      } as unknown as ReturnType<typeof getSongRepository>)
      const event = createEvent(undefined, { name, series })

      // Act
      const songs = await handler(event)

      // Assert
      expect(songs).not.toHaveLength(0)
      expect(list).toHaveBeenCalledWith(conditions)
    }
  )
})
