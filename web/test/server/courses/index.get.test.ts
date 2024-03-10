// @vitest-environment node
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { testCourseData } from '~/../core/test/data'
import handler from '~/server/api/v1/courses/index.get'
import { createEvent } from '~/test/test-utils-server'

describe('GET /api/v1/courses', () => {
  beforeEach(() => {
    vi.mocked($graphqlList).mockClear()
  })

  test.each([
    [undefined, undefined, {}],
    ['-1', '-1', {}],
    ['100', '100', {}],
    ['0.5', '0.5', {}],
    ['1', undefined, { type: -1 }],
    [undefined, '17', { series: 'DanceDanceRevolution A20 PLUS' }],
    ['2', '18', { type: -2, series: 'DanceDanceRevolution A3' }],
  ])(
    '?name=%s&series=%s calls $graphqlList(event, query, "courses", %o)',
    async (type, series, variables) => {
      // Arrange
      vi.mocked($graphqlList).mockResolvedValue([testCourseData])
      const event = createEvent(undefined, { type, series })

      // Act
      const courses = await handler(event)

      // Assert
      expect(courses).not.toHaveLength(0)
      expect(vi.mocked($graphqlList)).toBeCalledWith(
        event,
        expect.any(String),
        'courses',
        variables
      )
    }
  )
})
