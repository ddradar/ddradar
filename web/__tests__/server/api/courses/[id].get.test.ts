import { testCourseData } from '@ddradar/core/__tests__/data'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~~/__tests__/server/test-util'
import getCourseInfo from '~~/server/api/v1/courses/[id].get'
import { callGraphQL } from '~~/server/utils/graphQL'
import { sendNullWithError } from '~~/server/utils/http'

vi.mock('~~/utils/graphQL')
vi.mock('~~/server/utils/http')

describe('GET /api/v1/courses/[id]', () => {
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
  })

  test(`/${testCourseData.id} (exist course) returns CourseInfo`, async () => {
    // Arrange
    vi.mocked(callGraphQL).mockResolvedValue({
      data: { course_by_pk: testCourseData },
    })
    const event = createEvent({ id: testCourseData.id })

    // Act
    const course = await getCourseInfo(event)

    // Assert
    expect(course).toBe(testCourseData)
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
  })

  test(`/00000000000000000000000000000000 (not exist song) returns 404`, async () => {
    // Arrange
    vi.mocked(callGraphQL).mockResolvedValue({ data: { course_by_pk: null } })
    const event = createEvent({ id: `00000000000000000000000000000000` })

    // Act
    const course = await getCourseInfo(event)

    // Assert
    expect(course).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  test(`/invalid-id returns 400`, async () => {
    // Arrange
    vi.mocked(callGraphQL).mockResolvedValue({ data: { course_by_pk: null } })
    const event = createEvent({ id: 'invalid-id' })

    // Act
    const course = await getCourseInfo(event)

    // Assert
    expect(course).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 400)
  })
})
