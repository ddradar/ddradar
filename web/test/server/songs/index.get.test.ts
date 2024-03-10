// @vitest-environment node
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { testSongList } from '~/../core/test/data'
import handler from '~/server/api/v1/songs/index.get'
import { createEvent } from '~/test/test-utils-server'

describe('GET /api/v1/songs', () => {
  beforeEach(() => {
    vi.mocked($graphqlList).mockClear()
  })

  test.each([
    [undefined, undefined, {}],
    ['-1', '-1', {}],
    ['0.5', '0.5', {}],
    ['100', '100', {}],
    ['25', undefined, { name: 25 }],
    [undefined, '10', { series: 'DDR X' }],
    ['25', '0', { name: 25, series: 'DDR 1st' }],
  ])(
    '?name=%s&series=%s calls $graphqlList(event, query, "songs", %o)',
    async (name, series, variables) => {
      // Arrange
      vi.mocked($graphqlList).mockResolvedValue([...testSongList])
      const event = createEvent(undefined, { name, series })

      // Act
      const songs = await handler(event)

      // Assert
      expect(songs).not.toHaveLength(0)
      expect(vi.mocked($graphqlList)).toBeCalledWith(
        event,
        expect.any(String),
        'songs',
        variables
      )
    }
  )
})
