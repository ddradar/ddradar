import type { Context } from '@azure/functions'

import type { SongSchema } from '../db/songs'
import getSongInfo from '.'

jest.mock('../db/songs')

describe('GET /api/v1/songs', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
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
  beforeEach(() => (context.bindingData = {}))

  test(`returns "200 OK" with JSON if documents contain 1 song`, async () => {
    // Arrange
    context.bindingData.id = song.id

    // Act
    const result = await getSongInfo(context, null, [song])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(song)
  })

  test(`returns "404 Not Found" if documents is []`, async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    const result = await getSongInfo(context, null, [])

    // Assert
    expect(result.status).toBe(404)
    expect(result.body).toMatch(/"foo"/)
  })

  test(`returns "404 Not Found" if documents has 2 or more songs`, async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    const result = await getSongInfo(context, null, [song, song])

    // Assert
    expect(result.status).toBe(404)
    expect(result.body).toMatch(/"foo"/)
  })
})
