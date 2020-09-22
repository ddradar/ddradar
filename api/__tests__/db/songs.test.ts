import { canConnectDB, getContainer } from '../../db'
import {
  CourseSchema,
  fetchSongInfo,
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
  describeIf(canConnectDB)('Cosmos DB integration test', () => {
    const songs: SongSchema[] = [
      {
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
          {
            playStyle: 1,
            difficulty: 1,
            level: 8,
            notes: 264,
            freezeArrow: 0,
            shockArrow: 0,
            stream: 56,
            voltage: 44,
            air: 18,
            freeze: 0,
            chaos: 4,
          },
          {
            playStyle: 1,
            difficulty: 2,
            level: 9,
            notes: 275,
            freezeArrow: 0,
            shockArrow: 0,
            stream: 58,
            voltage: 52,
            air: 49,
            freeze: 0,
            chaos: 6,
          },
          {
            playStyle: 1,
            difficulty: 3,
            level: 11,
            notes: 319,
            freezeArrow: 0,
            shockArrow: 0,
            stream: 67,
            voltage: 52,
            air: 25,
            freeze: 0,
            chaos: 17,
          },
          {
            playStyle: 2,
            difficulty: 1,
            level: 8,
            notes: 254,
            freezeArrow: 0,
            shockArrow: 0,
            stream: 54,
            voltage: 37,
            air: 61,
            freeze: 0,
            chaos: 2,
          },
          {
            playStyle: 2,
            difficulty: 2,
            level: 13,
            notes: 309,
            freezeArrow: 0,
            shockArrow: 0,
            stream: 65,
            voltage: 60,
            air: 56,
            freeze: 0,
            chaos: 13,
          },
          {
            playStyle: 2,
            difficulty: 3,
            level: 11,
            notes: 382,
            freezeArrow: 0,
            shockArrow: 0,
            stream: 81,
            voltage: 60,
            air: 60,
            freeze: 0,
            chaos: 31,
          },
        ],
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
        charts: [
          {
            playStyle: 1,
            difficulty: 4,
            level: 13,
            notes: 371,
            freezeArrow: 12,
            shockArrow: 0,
            stream: 78,
            voltage: 60,
            air: 65,
            freeze: 18,
            chaos: 26,
          },
          {
            playStyle: 2,
            difficulty: 4,
            level: 14,
            notes: 352,
            freezeArrow: 42,
            shockArrow: 0,
            stream: 74,
            voltage: 60,
            air: 76,
            freeze: 48,
            chaos: 27,
          },
        ],
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
        charts: [
          {
            playStyle: 1,
            difficulty: 4,
            level: 11,
            notes: 254,
            freezeArrow: 18,
            shockArrow: 0,
            stream: 63,
            voltage: 53,
            air: 61,
            freeze: 43,
            chaos: 29,
          },
          {
            playStyle: 2,
            difficulty: 4,
            level: 12,
            notes: 262,
            freezeArrow: 11,
            shockArrow: 0,
            stream: 65,
            voltage: 53,
            air: 40,
            freeze: 22,
            chaos: 30,
          },
        ],
      },
    ]
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

    beforeAll(async () => {
      await Promise.all(songs.map(s => getContainer('Songs').items.create(s)))
      await Promise.all(courses.map(c => getContainer('Songs').items.create(c)))
    })
    afterAll(async () => {
      await Promise.all(
        songs.map(s => getContainer('Songs').item(s.id, s.nameIndex).delete())
      )
      await Promise.all(
        courses.map(c => getContainer('Songs').item(c.id, c.nameIndex).delete())
      )
    })

    describe('fetchSongInfo', () => {
      test.each(['', 'foo', courses[0].id])('(%s) returns null', async id => {
        // Arrange - Act
        const song = await fetchSongInfo(id)

        // Assert
        expect(song).toBeNull()
      })
      test.each([
        [songs[0].id, songs[0]],
        [songs[1].id, songs[1]],
      ])('(%s) returns %p', async (id, expected) => {
        // Arrange - Act
        const song = await fetchSongInfo(id)

        // Assert
        expect(song).toStrictEqual(expected)
      })
    })

    describe('fetchSongList', () => {
      const removeCharts = (song: SongSchema) => ({
        id: song.id,
        name: song.name,
        nameKana: song.nameKana,
        nameIndex: song.nameIndex,
        artist: song.artist,
        series: song.series,
        minBPM: song.minBPM,
        maxBPM: song.maxBPM,
      })

      test.each([
        [0, 0],
        [undefined, 17],
        [50, undefined],
      ])('(%i, %i) returns []', async (name, series) => {
        // Arrange - Act
        const result = await fetchSongList(name, series)

        // Assert
        expect(result).toHaveLength(0)
      })

      test.each([
        [25, 0, [removeCharts(songs[0])]],
        [25, 10, [removeCharts(songs[1])]],
        [28, undefined, [removeCharts(songs[2])]],
        [25, undefined, [removeCharts(songs[0]), removeCharts(songs[1])]],
      ])('(%i, %i) returns %p', async (name, series, expected) => {
        // Arrange - Act
        const result = await fetchSongList(name, series)

        // Assert
        expect(result).toStrictEqual(expected)
      })
    })
  })
})
