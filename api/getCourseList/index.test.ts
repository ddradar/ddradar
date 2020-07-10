import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import type { CourseSchema, Order } from '../db/courses'
import getCourseList from '.'

type ShrinkedCourse = Omit<CourseSchema, 'orders'> & {
  orders: Omit<Order, 'chartOrder'>[]
}

describe('GET /api/v1/courses', () => {
  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const courses: ShrinkedCourse[] = [
        {
          id: 'q6oOPqQPlOQoooq888bPI1OPDlqDIQQD',
          name: 'PASSION',
          series: 'DanceDanceRevolution A20',
          orders: [
            {
              playStyle: 1,
              difficulty: 0,
              level: 4,
            },
            {
              playStyle: 1,
              difficulty: 1,
              level: 7,
            },
            {
              playStyle: 1,
              difficulty: 2,
              level: 11,
            },
            {
              playStyle: 1,
              difficulty: 3,
              level: 15,
            },
            {
              playStyle: 1,
              difficulty: 4,
              level: 17,
            },
            {
              playStyle: 2,
              difficulty: 1,
              level: 7,
            },
            {
              playStyle: 2,
              difficulty: 2,
              level: 11,
            },
            {
              playStyle: 2,
              difficulty: 3,
              level: 16,
            },
            {
              playStyle: 2,
              difficulty: 4,
              level: 18,
            },
          ],
        },
        {
          id: '19id1DO6q9Pb1681db61D8D8oQi9dlb6',
          name: '初段',
          series: 'DanceDanceRevolution A20',
          orders: [
            {
              playStyle: 1,
              difficulty: 4,
              level: 10,
            },
          ],
        },
        {
          id: 'bPQDblO8Do0Oo9O0PP0b8PO1PblDioDP',
          name: '十段',
          series: 'DanceDanceRevolution A20',
          orders: [
            {
              playStyle: 2,
              difficulty: 4,
              level: 19,
            },
          ],
        },
      ]

      beforeAll(async () => {
        const container = getContainer('Courses')
        await Promise.all(courses.map(c => container.items.create(c)))
      })

      test('returns "200 OK" with JSON body', async () => {
        // Act
        const result = await getCourseList()

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual(courses)
      })

      afterAll(async () => {
        const container = getContainer('Courses')
        await Promise.all(courses.map(c => container.item(c.id, c.id).delete()))
      })
    }
  )
})
