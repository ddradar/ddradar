import type { Context } from '@azure/functions'

import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import { CourseSchema, Order } from '../course'
import getCourseList from '.'

type ShrinkedCourse = Omit<CourseSchema, 'orders'> & {
  orders: Omit<Order, 'chartOrder'>[]
}

describe('GET /api/courses', () => {
  let context: Context

  beforeEach(() => {
    context = {} as Context
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const courses: ShrinkedCourse[] = [
        {
          id: 'q6oOPqQPlOQoooq888bPI1OPDlqDIQQD',
          name: 'PASSION',
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
          orders: [
            {
              playStyle: 2,
              difficulty: 4,
              level: 19,
            },
          ],
        },
      ]

      test('returns "404 Not Found" if empty', async () => {
        // Act
        await getCourseList(context)

        // Assert
        expect(context.res.status).toBe(404)
        expect(context.res.body).toBe('Not found courses')
      })

      test('returns "200 OK" with JSON body', async () => {
        // Arrange
        const container = getContainer('Courses')
        for (const song of courses) {
          await container.items.create(song)
        }

        // Act
        await getCourseList(context)

        // Assert
        expect(context.res.status).toBe(200)
        expect(context.res.body).toStrictEqual(courses)

        for (const course of courses) {
          await container.item(course.id, course.id).delete()
        }
      })
    }
  )
})
