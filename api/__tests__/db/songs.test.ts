import { getConnectionString, getContainer } from '../../db'
import {
  CourseSchema,
  fetchCourse,
  fetchSong,
  fetchSongList,
  isSongSchema,
  SongSchema,
} from '../../db/songs'
import { describeIf } from '../util'

describe('./db/songs.ts', () => {
  describe('isSongSchema', () => {
    const validSong: SongSchema = {
      id: '00000000000000000000000000000000',
      name: 'Test Song',
      nameIndex: 29,
      nameKana: 'TEST SONG',
      artist: 'Test Artist',
      series: 'DanceDanceRevolution A20',
      minBPM: 150,
      maxBPM: 150,
      charts: [
        {
          playStyle: 1,
          difficulty: 0,
          level: 1,
          notes: 100,
          freezeArrow: 1,
          shockArrow: 0,
          voltage: 10,
          stream: 9,
          air: 2,
          freeze: 1,
          chaos: 0,
        },
      ],
    }
    test.each([undefined, null, true, 1.5, 'foo', [], {}])(
      '(%p) returns false',
      (obj: unknown) => expect(isSongSchema(obj)).toBe(false)
    )
    test.each([
      { ...validSong, id: '' },
      { ...validSong, nameKana: 'abc' },
      { ...validSong, series: 'DDR FESTIVAL' },
      { ...validSong, nameIndex: 0.5 },
      { ...validSong, nameIndex: -1 },
      { ...validSong, nameIndex: 37 },
      { ...validSong, minBPM: null },
      { ...validSong, maxBPM: null },
      { ...validSong, charts: {} },
    ])('(%p) returns false', (obj: unknown) =>
      expect(isSongSchema(obj)).toBe(false)
    )
    test.each([
      { ...validSong, charts: [...validSong.charts, {}] },
      { ...validSong, charts: [{ ...validSong.charts[0], notes: '' }] },
      { ...validSong, charts: [{ ...validSong.charts[0], playStyle: 3 }] },
      { ...validSong, charts: [{ ...validSong.charts[0], difficulty: -1 }] },
      { ...validSong, charts: [{ ...validSong.charts[0], difficulty: 5 }] },
      { ...validSong, charts: [{ ...validSong.charts[0], level: 0 }] },
      { ...validSong, charts: [{ ...validSong.charts[0], level: 21 }] },
    ])('(%p) returns false', (obj: unknown) =>
      expect(isSongSchema(obj)).toBe(false)
    )

    test.each([
      validSong,
      { ...validSong, name: 'テスト', nameKana: 'てすと', nameIndex: 3 },
      { ...validSong, minBPM: null, maxBPM: null },
      { ...validSong, charts: [] },
    ])('(%p) returns true', (obj: unknown) =>
      expect(isSongSchema(obj)).toBe(true)
    )
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      describe('fetchSong', () => {
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

        beforeAll(async () => {
          await getContainer('Songs').items.create(song)
          await getContainer('Songs').items.create(course)
        })
        afterAll(async () => {
          await getContainer('Songs').item(song.id, song.nameIndex).delete()
          await getContainer('Songs').item(course.id, course.nameIndex).delete()
        })

        test.each([
          ['00000000000000000000000000000000', null],
          ['o1Q8Ol8Dol9b0dllD6P0iPQbIoP666Db', null],
          ['06loOQ0DQb0DqbOibl6qO81qlIdoP9DI', song],
        ])('("%s") returns %p', async (id, expected) => {
          // Arrange - Act
          const result = await fetchSong(id)

          // Assert
          expect(result).toStrictEqual(expected)
        })
      })

      describe('fetchCourse', () => {
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

        beforeAll(async () => {
          await getContainer('Songs').items.create(song)
          await getContainer('Songs').items.create(course)
        })
        afterAll(async () => {
          await getContainer('Songs').item(song.id, song.nameIndex).delete()
          await getContainer('Songs').item(course.id, course.nameIndex).delete()
        })

        test.each([
          ['00000000000000000000000000000000', null],
          ['o1Q8Ol8Dol9b0dllD6P0iPQbIoP666Db', course],
          ['06loOQ0DQb0DqbOibl6qO81qlIdoP9DI', null],
        ])('("%s") returns %p', async (id, expected) => {
          // Arrange - Act
          const result = await fetchCourse(id)

          // Assert
          expect(result).toStrictEqual(expected)
        })
      })

      describe('fetchSongList', () => {
        const songs: Omit<SongSchema, 'charts'>[] = [
          {
            id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            name: 'PARANOiA',
            nameKana: 'PARANOIA',
            nameIndex: 25,
            artist: '180',
            series: 'DDR 1st',
            minBPM: 180,
            maxBPM: 180,
          },
          {
            id: 'I8bQ8ilD9l1Qi9Q9iI0q6qqqiolo01QP',
            name: 'PARANOiA(X-Special)',
            nameKana: 'PARANOIA X SPECIAL',
            nameIndex: 25,
            artist: '180',
            series: 'DDR X',
            minBPM: 180,
            maxBPM: 180,
          },
          {
            id: 'dDO8ili1081QQIb86POQ8qd0P111011o',
            name: 'SP-TRIP MACHINE～JUNGLE MIX～(X-Special)',
            nameKana: 'SP TRIP MACHINE JUNGLE MIX X SPECIAL',
            nameIndex: 28,
            artist: 'DE-SIRE',
            series: 'DDR X',
            minBPM: 160,
            maxBPM: 160,
          },
        ]
        const course: CourseSchema = {
          id: 'o1Q8Ol8Dol9b0dllD6P0iPQbIoP666Db',
          name: '皆伝',
          nameIndex: -2,
          nameKana: '2-11',
          series: 'DDR X',
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
                  songName: 'Over The "Period"',
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
          const c = getContainer('Songs')
          await Promise.all(songs.map(s => c.items.create(s)))
          await c.items.create(course)
        })
        afterAll(async () => {
          const c = getContainer('Songs')
          await Promise.all(songs.map(s => c.item(s.id, s.nameIndex).delete()))
          await c.item(course.id, course.nameIndex).delete()
        })

        test.each([
          [0, 0, []],
          [undefined, undefined, songs],
          [undefined, 0, [songs[0]]],
          [25, 0, [songs[0]]],
          [25, 10, [songs[1]]],
          [28, 10, [songs[2]]],
          [undefined, 10, [songs[1], songs[2]]],
        ])('(%p, %p) returns %p', async (name, series, expected) => {
          // Arrange - Act
          const result = await fetchSongList(name, series)

          // Assert
          expect(result).toStrictEqual(expected)
        })
      })
    }
  )
})
