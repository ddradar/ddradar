import { mocked } from 'ts-jest/utils'

import { fetchCourseList } from '../db/songs'
import getCourseList from '.'

jest.mock('../db/songs')

describe('GET /api/v1/courses', () => {
  const req = { query: {} }
  const courses = [
    {
      id: '19id1DO6q9Pb1681db61D8D8oQi9dlb6',
      name: '初段',
      series: 'DanceDanceRevolution A20',
      charts: [
        {
          playStyle: 1,
          difficulty: 4,
          level: 10,
        } as const,
      ],
    },
  ]
  beforeEach(() => {
    req.query = {}
    mocked(fetchCourseList).mockClear()
    mocked(fetchCourseList).mockResolvedValue(courses)
  })

  test.each([
    [1, 16, -1, 16],
    [2, 17, -2, 17],
    ['', '', undefined, undefined],
  ])(
    '?type=%i&series=%i calls fetchCourseList(%i, %i)',
    async (type, series, arg1, arg2) => {
      // Arrange
      req.query = { type, series }

      // Act
      const result = await getCourseList(null, req)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toBe(courses)
      expect(mocked(fetchCourseList)).toBeCalledWith(arg1, arg2)
    }
  )
})
