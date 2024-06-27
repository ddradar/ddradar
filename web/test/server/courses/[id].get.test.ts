// @vitest-environment node
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { testCourseData, testSongData } from '~/../core/test/data'
import handler from '~/server/api/v1/courses/[id].get'
import { createEvent } from '~/test/test-utils-server'

describe('GET /api/v1/courses/[id]', () => {
  beforeEach(() => {
    vi.mocked($graphql).mockClear()
  })

  test(`/${testCourseData.id} (exist course) returns CourseInfo`, async () => {
    // Arrange
    vi.mocked($graphql).mockResolvedValue({ course_by_pk: testCourseData })
    const event = createEvent({ id: testCourseData.id })

    // Act
    const course = await handler(event)

    // Assert
    expect(course).toBe(testCourseData)
    expect(vi.mocked($graphql)).toBeCalled()
  })

  test(`/00000000000000000000000000000000 (not exist song) returns 404`, async () => {
    // Arrange
    vi.mocked($graphql).mockResolvedValue({ course_by_pk: null })
    const event = createEvent({ id: `00000000000000000000000000000000` })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked($graphql)).toBeCalled()
  })

  test(`/${testSongData.id} (song data) returns 404`, async () => {
    // Arrange
    vi.mocked($graphql).mockResolvedValue({ course_by_pk: testSongData })
    const event = createEvent({ id: testSongData.id })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked($graphql)).toBeCalled()
  })

  test(`/invalid-id returns 400`, async () => {
    // Arrange
    vi.mocked($graphql).mockResolvedValue({ course_by_pk: null })
    const event = createEvent({ id: 'invalid-id' })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked($graphql)).not.toBeCalled()
  })
})
