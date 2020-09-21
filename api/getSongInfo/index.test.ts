import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { fetchSongInfo, SongSchema } from '../db/songs'
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
  beforeEach(() => {
    context.bindingData = {}
    mocked(fetchSongInfo).mockClear()
    mocked(fetchSongInfo).mockResolvedValue(song)
  })

  test(`/${song.id} returns "200 OK" with JSON`, async () => {
    // Arrange
    context.bindingData.id = song.id

    // Act
    const result = await getSongInfo(context)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(song)
    expect(mocked(fetchSongInfo)).toBeCalledWith(song.id)
  })

  test('/foo returns "404 Not Found" if fetchSongInfo("foo") returns null', async () => {
    // Arrange
    context.bindingData.id = 'foo'
    mocked(fetchSongInfo).mockResolvedValueOnce(null)

    // Act
    const result = await getSongInfo(context)

    // Assert
    expect(result.status).toBe(404)
    expect(mocked(fetchSongInfo)).toBeCalledWith('foo')
  })
})
