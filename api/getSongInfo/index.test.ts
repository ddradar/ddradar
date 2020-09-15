import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { fetchSong, SongSchema } from '../db/songs'
import getSongInfo from '.'

jest.mock('../db/songs')

describe('GET /api/v1/songs', () => {
  let context: Pick<Context, 'bindingData'>
  const fetchMock = mocked(fetchSong)
  beforeEach(() => {
    fetchMock.mockClear()
    context = { bindingData: {} }
  })

  test('returns "404 Not Found" if fetchSong() returns null', async () => {
    // Arrange
    fetchMock.mockResolvedValue(null)
    context.bindingData.id = 'foo'

    // Act
    const result = await getSongInfo(context)

    // Assert
    expect(result.status).toBe(404)
  })

  test('returns "200 OK" with JSON body if fetchSong() returns song', async () => {
    // Arrange
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
    fetchMock.mockResolvedValue(song)
    context.bindingData.id = 'foo'

    // Act
    const result = await getSongInfo(context)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual(song)
  })
})
