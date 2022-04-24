import type { Context } from '@azure/functions'
import { testCourseData as course } from '@ddradar/core/__tests__/data'
import { beforeEach, describe, expect, test } from 'vitest'

import getCourseInfo from '.'

describe('GET /api/v1/courses/{id}', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  beforeEach(() => {
    context.bindingData = {}
  })

  test(`returns "404 Not Found" if no course that matches id.`, async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    const result = await getCourseInfo(context, null, [])

    // Assert
    expect(result.status).toBe(404)
  })

  test(`returns "200 OK" with JSON body if found`, async () => {
    // Arrange
    context.bindingData.id = course.id

    // Act
    const result = await getCourseInfo(context, null, [course])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(course)
  })
})
