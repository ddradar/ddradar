import { testCourseData } from '@ddradar/core/__tests__/data'
import { fetchOne } from '@ddradar/db'
import { createError, sendError } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import getCourseInfo from '~/server/api/v1/courses/[id].get'
import { addCORSHeader } from '~/server/auth'

import { createEvent } from '../../test-util'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~/server/auth')

describe('GET /api/v1/courses', () => {
  beforeEach(() => {
    vi.mocked(createError).mockClear()
    vi.mocked(sendError).mockClear()
    vi.mocked(addCORSHeader).mockClear()
  })

  test(`/${testCourseData.id} (exist course) returns CourseInfo`, async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(testCourseData as any)
    const event = createEvent({ id: testCourseData.id })

    // Act
    const course = await getCourseInfo(event)

    // Assert
    expect(vi.mocked(addCORSHeader)).toBeCalledWith(event)
    expect(vi.mocked(sendError)).not.toBeCalled()
    expect(course).toBe(testCourseData)
  })

  test(`/00000000000000000000000000000000 (not exist song) returns 404`, async () => {
    // Arrange
    vi.mocked(fetchOne).mockResolvedValue(null)
    const event = createEvent({ id: `00000000000000000000000000000000` })

    // Act
    const course = await getCourseInfo(event)

    // Assert
    expect(vi.mocked(addCORSHeader)).toBeCalledWith(event)
    expect(vi.mocked(sendError)).toBeCalled()
    expect(vi.mocked(createError)).toBeCalledWith({ statusCode: 404 })
    expect(course).toBeNull()
  })

  test(`/ returns 400`, async () => {
    // Arrange
    vi.mocked(fetchOne).mockResolvedValue(null)
    const event = createEvent({})

    // Act
    const course = await getCourseInfo(event)

    // Assert
    expect(vi.mocked(addCORSHeader)).toBeCalledWith(event)
    expect(vi.mocked(sendError)).toBeCalled()
    expect(vi.mocked(createError)).toBeCalledWith({ statusCode: 400 })
    expect(course).toBeNull()
  })

  test(`/invalid-id returns 400`, async () => {
    // Arrange
    vi.mocked(fetchOne).mockResolvedValue(null)
    const event = createEvent({ id: 'invalid-id' })

    // Act
    const course = await getCourseInfo(event)

    // Assert
    expect(vi.mocked(addCORSHeader)).toBeCalledWith(event)
    expect(vi.mocked(sendError)).toBeCalled()
    expect(vi.mocked(createError)).toBeCalledWith({ statusCode: 400 })
    expect(course).toBeNull()
  })
})
