import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import type { CourseInfoSchema, CourseSchema, SongSchema } from '../db/songs'
import getCourseList from '.'

type ShrinkedCourse = Pick<CourseSchema, 'id' | 'name' | 'series'> & {
  charts: Pick<CourseInfoSchema, 'playStyle' | 'difficulty' | 'level'>[]
}

describe('GET /api/v1/courses', () => {
  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const courses: ShrinkedCourse[] = [
        {
          id: '19id1DO6q9Pb1681db61D8D8oQi9dlb6',
          name: '初段',
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
          id: 'bPQDblO8Do0Oo9O0PP0b8PO1PblDioDP',
          name: '十段',
          series: 'DanceDanceRevolution A20',
          charts: [
            {
              playStyle: 2,
              difficulty: 4,
              level: 19,
            },
          ],
        },
        {
          id: 'q6oOPqQPlOQoooq888bPI1OPDlqDIQQD',
          name: 'PASSION',
          series: 'DanceDanceRevolution A20',
          charts: [
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
      ]
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
        const container = getContainer('Songs')
        await Promise.all(
          courses.map(c =>
            container.items.create({
              ...c,
              nameIndex: c.charts.length === 1 ? -2 : -1,
            })
          )
        )
        await container.items.create(song)
      })

      test('returns "200 OK" with JSON body', async () => {
        // Act
        const result = await getCourseList()

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual(courses)
      })

      afterAll(async () => {
        const container = getContainer('Songs')
        await Promise.all(
          courses.map(c =>
            container.item(c.id, c.charts.length === 1 ? -2 : -1).delete()
          )
        )
        await container.item(song.id, song.nameIndex).delete()
      })
    }
  )
})
