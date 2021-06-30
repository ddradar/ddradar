import type { Context } from '@azure/functions'
import { testCourseData as course } from '@ddradar/core/__tests__/data'

import getCourseInfo from '.'

describe('GET /api/v1/courses/{id}', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  beforeEach(() => (context.bindingData = {}))

  test(`returns "200 OK" with JSON if documents contain 1 course`, async () => {
    // Arrange
    context.bindingData.id = course.id

    // Act
    const result = await getCourseInfo(context, null, [course])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(course)
  })

  test(`returns "404 Not Found" if documents is []`, async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    const result = await getCourseInfo(context, null, [])

    // Assert
    expect(result.status).toBe(404)
    expect(result.body).toMatch(/"foo"/)
  })
})
