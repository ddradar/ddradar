// @vitest-environment node
import { queryContainer } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { testSongList } from '~~/../core/test/data'
import handler from '~~/server/api/v1/songs/index.get'
import { createEvent } from '~~/test/test-utils-server'

vi.mock('@ddradar/db')

describe('GET /api/v1/songs', () => {
  beforeEach(() => {
    vi.mocked(queryContainer).mockClear()
  })

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
    '?name=%s&series=%s calls queryContainer(client, "Songs", query, %o)',
    async (name, series, conditions) => {
      // Arrange
      vi.mocked(queryContainer).mockReturnValue({
        fetchAll: vi.fn().mockResolvedValue({ resources: [...testSongList] }),
      } as unknown as ReturnType<typeof queryContainer>)
      const event = createEvent(undefined, { name, series })

      // Act
      const songs = await handler(event)

      // Assert
      expect(songs).not.toHaveLength(0)
      expect(vi.mocked(queryContainer)).toBeCalledWith(
        undefined,
        'Songs',
        expect.any(Array),
        conditions
      )
    }
  )
})
