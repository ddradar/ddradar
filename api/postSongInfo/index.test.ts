import type { SongSchema } from '../db'
import postSongInfo from '.'

describe('POST /api/v1/admin/songs', () => {
  const validSong: SongSchema = {
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
  }

  test.each([
    undefined,
    null,
    true,
    1,
    'foo',
    {},
    { ...validSong, id: undefined },
    { ...validSong, maxBPM: null },
  ])('returns "400 Bad Request" if body is %p', async (body: unknown) => {
    // Arrange
    const req = { body }

    // Act
    const result = await postSongInfo(null, req)

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test.each([
    validSong,
    {
      ...validSong,
      charts: validSong.charts.sort((l, r) => l.difficulty - r.difficulty),
    },
    {
      ...validSong,
      foo: 'bar',
    },
  ])('returns "200 OK" with JSON body if body is %p', async body => {
    // Arrange - Act
    const result = await postSongInfo(null, { body })

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual(validSong)
    expect(result.document).toStrictEqual(validSong)
  })
})
