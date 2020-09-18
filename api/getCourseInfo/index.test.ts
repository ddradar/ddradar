import type { Context } from '@azure/functions'

import { describeIf } from '../__tests__/util'
import {
  CourseSchema,
  getConnectionString,
  getContainer,
  SongSchema,
} from '../db'
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
      const container = getContainer('Songs')
      const course: CourseSchema = {
        id: 'o1Q8Ol8Dol9b0dllD6P0iPQbIoP666Db',
        name: '皆伝',
        nameIndex: -2,
        nameKana: '2-11',
        series: 'DanceDanceRevolution A20',
        minBPM: 23,
        maxBPM: 840,
        charts: [
          {
            playStyle: 2,
            difficulty: 4,
            level: 19,
            notes: 634 + 640 + 759 + 804,
            freezeArrow: 45 + 10 + 28 + 1,
            shockArrow: 0,
            order: [
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
      const song: SongSchema = {
        id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
        name: 'PARANOiA',
        nameKana: 'PARANOIA',
        nameIndex: 25,
        artist: '180',
        series: 'DDR 1st',
        minBPM: 180,
        maxBPM: 180,
        charts: [
          {
            playStyle: 1,
            difficulty: 0,
            level: 4,
            notes: 138,
            freezeArrow: 0,
            shockArrow: 0,
            stream: 29,
            voltage: 22,
            air: 5,
            freeze: 0,
            chaos: 0,
          },
        ],
      }

      beforeAll(async () => {
        await container.items.create(course)
        await container.items.create(song)
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

      test('/06loOQ0DQb0DqbOibl6qO81qlIdoP9DI returns "404 Not Found"', async () => {
        // Arrange
        const id = song.id
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
        await container.item(course.id, course.nameIndex).delete()
        await container.item(song.id, song.nameIndex).delete()
      })
    }
  )
})
