import { beforeEach, describe, expect, test } from '@jest/globals'

import getCourseList from '.'

describe('GET /api/v1/courses', () => {
  const req = { query: {} }
  const courses = [
    {
      id: '19id1DO6q9Pb1681db61D8D8oQi9dlb6',
      name: '初段',
      nameIndex: -2,
      series: 'DanceDanceRevolution A20',
      charts: [
        {
          playStyle: 1,
          difficulty: 4,
          level: 10,
        },
      ],
    },
    {
      id: 'q6oOPqQPlOQoooq888bPI1OPDlqDIQQD',
      name: 'PASSION',
      nameIndex: -1,
      series: 'DanceDanceRevolution A20',
      minBPM: 140,
      maxBPM: 182,
      charts: [
        {
          playStyle: 1,
          difficulty: 0,
          level: 4,
        },
      ],
    },
    {
      id: '6bo6ID6l11qd6lolilI6o6q8I6ddo88i',
      name: '初段',
      nameIndex: -2,
      series: 'DanceDanceRevolution A20 PLUS',
      charts: [
        {
          playStyle: 1,
          difficulty: 4,
          level: 10,
        },
      ],
    },
    {
      id: 'O6Pi0O800b8b6d9dd9P89dD1900I1q80',
      name: 'HYPER',
      nameIndex: -1,
      series: 'DanceDanceRevolution A20 PLUS',
      charts: [
        {
          playStyle: 1,
          difficulty: 0,
          level: 5,
        },
      ],
    },
  ] as const
  beforeEach(() => {
    req.query = {}
  })

  test.each([
    ['1', '16', 1],
    ['2', '17', 1],
    ['', '', 4],
    [undefined, undefined, 4],
  ])('?type=%s&series=%s returns %i courses', async (type, series, length) => {
    // Arrange
    req.query = { type, series }

    // Act
    const result = await getCourseList(null, req, courses)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(length)
  })
})
