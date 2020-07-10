import type { Context } from '@azure/functions'

import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import type { CourseSchema } from '../db'
import getCourseInfo from '.'

describe('GET /api/v1/courses', () => {
  let context: Pick<Context, 'bindingData'>
  beforeEach(() => {
    context = { bindingData: {} }
  })

  test('/ returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await getCourseInfo(context)

    // Assert
    expect(result.status).toBe(404)
  })

  test('/foo returns "404 Not Found"', async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    const result = await getCourseInfo(context)

    // Assert
    expect(result.status).toBe(404)
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const container = getContainer('Courses')
      const course: CourseSchema = {
        id: 'o1Q8Ol8Dol9b0dllD6P0iPQbIoP666Db',
        name: '皆伝',
        series: 'DanceDanceRevolution A20',
        orders: [
          {
            playStyle: 2,
            difficulty: 4,
            level: 19,
            chartOrder: [
              {
                songId: '186dd6DQq891Ib9Ilq8Qbo8lIqb0Qoll',
                songName: 'Valkyrie dimension',
                playStyle: 2,
                difficulty: 4,
                level: 19,
              },
              {
                songId: 'q6di1DQbi88i9QlPol1iIPbb8lP1qP1b',
                songName: 'POSSESSION',
                playStyle: 2,
                difficulty: 4,
                level: 19,
              },
              {
                songId: '6bid6d9qPQ80DOqiidQQ891o6Od8801l',
                songName: 'Over The “Period”',
                playStyle: 2,
                difficulty: 4,
                level: 19,
              },
              {
                songId: '9i0q91lPPiO61b9P891O1i86iOP1I08O',
                songName: 'EGOISM 440',
                playStyle: 2,
                difficulty: 4,
                level: 19,
              },
            ],
          },
        ],
      }

      beforeAll(async () => {
        await container.items.create(course)
      })

      test('/00000000000000000000000000000000 returns "404 Not Found"', async () => {
        // Arrange
        const id = '00000000000000000000000000000000'
        context.bindingData.id = id

        // Act
        const result = await getCourseInfo(context)

        // Assert
        expect(result.status).toBe(404)
        expect(result.body).toBe(`Not found course that id: "${id}"`)
      })

      test('/o1Q8Ol8Dol9b0dllD6P0iPQbIoP666Db returns "200 OK" with JSON body', async () => {
        // Arrange
        context.bindingData.id = course.id

        // Act
        const result = await getCourseInfo(context)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual(course)
      })

      afterAll(async () => {
        await container.item(course.id, course.id).delete()
      })
    }
  )
})
