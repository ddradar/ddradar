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
      const courses: CourseSchema[] = [
        {
          id: '19id1DO6q9Pb1681db61D8D8oQi9dlb6',
          name: '初段',
          nameKana: 'D-A20-1-01',
          nameIndex: -2,
          series: 'DanceDanceRevolution A20',
          minBPM: 124,
          maxBPM: 155,
          charts: [
            {
              playStyle: 1,
              difficulty: 4,
              level: 10,
              notes: 1019,
              freezeArrow: 37,
              shockArrow: 0,
              order: [
                {
                  songId: 'O1blDPOQ8IQb00o0D89QIDIlo8b06liD',
                  songName: 'HIGHER',
                  playStyle: 1,
                  difficulty: 3,
                  level: 9,
                },
                {
                  songId: 'q1o901oPqbbI1Q61qo688bDd0Pqlb08l',
                  songName: 'Shine',
                  playStyle: 1,
                  difficulty: 3,
                  level: 9,
                },
                {
                  songId: '8o6ibb0b1i66Q0D8699boob69b80Qb1i',
                  songName: 'IN THE ZONE',
                  playStyle: 1,
                  difficulty: 3,
                  level: 9,
                },
                {
                  songId: '6Qq1q91q8iIPlI89qDq96bO8QDD0qOql',
                  songName: 'B4U',
                  playStyle: 1,
                  difficulty: 3,
                  level: 10,
                },
              ],
            },
          ],
        },
        {
          id: 'bPQDblO8Do0Oo9O0PP0b8PO1PblDioDP',
          name: '十段',
          nameKana: 'D-A20-2-10',
          nameIndex: -2,
          series: 'DanceDanceRevolution A20',
          minBPM: 75,
          maxBPM: 888,
          charts: [
            {
              playStyle: 2,
              difficulty: 4,
              level: 19,
              notes: 2585,
              freezeArrow: 29,
              shockArrow: 0,
              order: [
                {
                  songId: '109P1iO9i6q1q0bdQobiodQDoD619dqd',
                  songName: 'Healing-D-Vision',
                  playStyle: 2,
                  difficulty: 4,
                  level: 18,
                },
                {
                  songId: 'io1d1Dq80Di08O1Pb9bQ8DoP9d9Ooi90',
                  songName: 'PARANOiA ～HADES～',
                  playStyle: 2,
                  difficulty: 4,
                  level: 18,
                },
                {
                  songId: 'id9oObq9P6Q6Pq6lQPqI88OP1DD8D0O1',
                  songName: '888',
                  playStyle: 2,
                  difficulty: 4,
                  level: 18,
                },
                {
                  songId: '606b9d6OiliId69bO9Odi6qq8o8Qd0dq',
                  songName: 'PARANOiA Revolution',
                  playStyle: 2,
                  difficulty: 4,
                  level: 19,
                },
              ],
            },
          ],
        },
        {
          id: 'q6oOPqQPlOQoooq888bPI1OPDlqDIQQD',
          name: 'PASSION',
          nameKana: 'C-A20-4',
          nameIndex: -1,
          series: 'DanceDanceRevolution A20',
          minBPM: 140,
          maxBPM: 182,
          charts: [
            {
              playStyle: 1,
              difficulty: 0,
              level: 4,
              notes: 425,
              freezeArrow: 1,
              shockArrow: 0,
              order: [
                {
                  songId: 'lIPP90Ilqib08Obob9901PiP19OQ18P9',
                  songName: 'Heatstroke',
                  playStyle: 1,
                  difficulty: 0,
                  level: 2,
                },
                {
                  songId: '901q61iP6lPiDqIQoQod9PDqlOPq1bb9',
                  songName: 'La Señorita',
                  playStyle: 1,
                  difficulty: 0,
                  level: 4,
                },
                {
                  songId: 'D0Q0oIDDqoQd0IQddi1IiD16dO16O88o',
                  songName: 'Seta Para Cima↑↑',
                  playStyle: 1,
                  difficulty: 0,
                  level: 3,
                },
                {
                  songId: 'bo6PqbbPQ6D096OIP6dDPbPPiDi88609',
                  songName: 'Spanish Snowy Dance',
                  playStyle: 1,
                  difficulty: 0,
                  level: 3,
                },
              ],
            },
          ],
        },
        {
          id: '6bo6ID6l11qd6lolilI6o6q8I6ddo88i',
          name: '初段',
          nameKana: 'D-A20PLUS-1-01',
          nameIndex: -2,
          series: 'DanceDanceRevolution A20 PLUS',
          minBPM: 155,
          maxBPM: 180,
          charts: [
            {
              playStyle: 1,
              difficulty: 4,
              level: 10,
              notes: 1161,
              freezeArrow: 50,
              shockArrow: 0,
              order: [
                {
                  songId: 'I0Ql0Di1qD6i0Qq1ql0qPb19q0IQ6iO9',
                  songName: 'FUJIMORI -祭- FESTIVAL',
                  playStyle: 1,
                  difficulty: 2,
                  level: 9,
                },
                {
                  songId: 'DbibObDP860iqI11POiqQDD0i8PPOibd',
                  songName: 'Sweet Rain',
                  playStyle: 1,
                  difficulty: 2,
                  level: 9,
                },
                {
                  songId: 'Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi',
                  songName: 'TRIP MACHINE',
                  playStyle: 1,
                  difficulty: 2,
                  level: 9,
                },
                {
                  songId: 'lQ1QDdooiOO9QPo8q91iD1IqI8Po9ODl',
                  songName: 'AWAKE',
                  playStyle: 1,
                  difficulty: 2,
                  level: 10,
                },
              ],
            },
          ],
        },
        {
          id: 'O6Pi0O800b8b6d9dd9P89dD1900I1q80',
          name: 'HYPER',
          nameKana: 'C-A20PLUS-2',
          nameIndex: -1,
          series: 'DanceDanceRevolution A20 PLUS',
          minBPM: 85,
          maxBPM: 190,
          charts: [
            {
              playStyle: 1,
              difficulty: 0,
              level: 5,
              notes: 475,
              freezeArrow: 8,
              shockArrow: 0,
              order: [
                {
                  songId: 'I08olqilqQi9Dd0qOq0o09PPqI0l11QI',
                  songName: 'HYPER EUROBEAT',
                  playStyle: 1,
                  difficulty: 0,
                  level: 3,
                },
                {
                  songId: 'OQbPdOIo6dPPIq6d8qid6DbPP0q991i6',
                  songName: '天上の星～黎明記～',
                  playStyle: 1,
                  difficulty: 0,
                  level: 2,
                },
                {
                  songId: 'Di8lP6PobQ6l8do0llO9IIqQ6iqqiqDo',
                  songName: 'Hyper Bomb',
                  playStyle: 1,
                  difficulty: 0,
                  level: 3,
                },
                {
                  songId: '0bq9qI9PoPIlQl89bDO60o9q8I1iIP66',
                  songName: 'HyperTwist',
                  playStyle: 1,
                  difficulty: 0,
                  level: 5,
                },
              ],
            },
          ],
        },
        {
          id: 'q0IObiQdI9o918O0DbPlldqd01liQ8Ql',
          name: '五段',
          nameKana: 'D-A20PLUS-2-05',
          nameIndex: -2,
          series: 'DanceDanceRevolution A20 PLUS',
          minBPM: 93,
          maxBPM: 246,
          charts: [
            {
              playStyle: 2,
              difficulty: 4,
              level: 14,
              notes: 1548,
              freezeArrow: 49,
              shockArrow: 0,
              order: [
                {
                  songId: 'Dl69Pb9OQDlbOi80OQdIObiQ1Q08Dlqo',
                  songName: '三毛猫ロック',
                  playStyle: 2,
                  difficulty: 3,
                  level: 13,
                },
                {
                  songId: '1Ol1i86OQd61IlqPb9O1060l0OQDoDQI',
                  songName: 'Condor',
                  playStyle: 2,
                  difficulty: 3,
                  level: 13,
                },
                {
                  songId: 'oIb699q80OIPdlP0odl6bqbD0PlQodOq',
                  songName: 'A',
                  playStyle: 2,
                  difficulty: 4,
                  level: 13,
                },
                {
                  songId: 'IPq8dO1lD8qidDlI0ObboI9IIldQO6IQ',
                  songName: 'RËVOLUTIФN',
                  playStyle: 2,
                  difficulty: 3,
                  level: 14,
                },
              ],
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
        await Promise.all(courses.map(c => container.items.create(c)))
        await container.items.create(song)
      })

      test('returns "200 OK" with JSON body', async () => {
        // Act
        const result = await getCourseList()

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toHaveLength(6)
        expect(result.body[0].id).toBe('q6oOPqQPlOQoooq888bPI1OPDlqDIQQD') // PASSION(A20)
        expect(result.body[1].id).toBe('O6Pi0O800b8b6d9dd9P89dD1900I1q80') // HYPER(A20 PLUS)
        expect(result.body[2].id).toBe('19id1DO6q9Pb1681db61D8D8oQi9dlb6') // SP初段(A20)
        expect(result.body[3].id).toBe('bPQDblO8Do0Oo9O0PP0b8PO1PblDioDP') // DP十段(A20)
        expect(result.body[4].id).toBe('6bo6ID6l11qd6lolilI6o6q8I6ddo88i') // SP初段(A20 PLUS)
        expect(result.body[5].id).toBe('q0IObiQdI9o918O0DbPlldqd01liQ8Ql') // DP五段(A20 PLUS)
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
