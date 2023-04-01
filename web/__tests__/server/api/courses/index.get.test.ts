import { testCourseData } from '@ddradar/core/test/data'
import { fetchList } from '@ddradar/db'
import { getQuery } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import searchCourses from '~/server/api/v1/courses/index.get'

vi.mock('@ddradar/db')
vi.mock('h3')

describe('GET /api/v1/courses', () => {
  beforeEach(() => {
    vi.mocked(fetchList).mockClear()
  })

  const defaultCond = { condition: 'c.nameIndex < 0' }
  test.each([
    [undefined, undefined, []],
    ['-1', '-1', []],
    ['100', '100', []],
    ['0.5', '0.5', []],
    ['1', undefined, [{ condition: 'c.nameIndex = @', value: -1 }]],
    [
      undefined,
      '17',
      [{ condition: 'c.series = @', value: 'DanceDanceRevolution A20 PLUS' }],
    ],
    [
      '2',
      '18',
      [
        { condition: 'c.nameIndex = @', value: -2 },
        { condition: 'c.series = @', value: 'DanceDanceRevolution A3' },
      ],
    ],
  ])(
    '?name=%s&series=%s calls fetchList(..., ..., %o)',
    async (type, series, expected) => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchList).mockResolvedValue([testCourseData] as any)
      vi.mocked(getQuery).mockReturnValue({ type, series })
      const event = createEvent()

      // Act
      const songs = await searchCourses(event)

      // Assert
      expect(songs).not.toHaveLength(0)
      const conditions = vi.mocked(fetchList).mock.calls[0][2]
      expect(conditions).toStrictEqual([defaultCond, ...expected])
    }
  )
})
