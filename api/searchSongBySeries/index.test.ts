import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { fetchSongList, SongSchema } from '../db/songs'
import searchSong from '.'

jest.mock('../db/songs', () => ({
  ...jest.genMockFromModule<Record<string, unknown>>('../db/songs'),
  SeriesList: jest.requireActual('../db/songs').SeriesList,
}))

describe('GET /api/v1/songs/series', () => {
  let context: Pick<Context, 'bindingData'>
  const fetchMock = mocked(fetchSongList)
  beforeEach(() => {
    fetchMock.mockClear()
    context = { bindingData: {} }
  })

  test('returns "404 Not Found" if fetchSongList() returns []', async () => {
    // Arrange
    fetchMock.mockResolvedValue([])
    context.bindingData.series = {} // if param is 0, passed object. (bug?)

    // Act
    const result = await searchSong(context, { query: { name: '0' } })

    // Assert
    expect(fetchMock).toBeCalledWith(0, 0)
    expect(result.status).toBe(404)
    expect(result.body).toBe(
      'Not found song that {series: "DDR 1st" nameIndex: 0}'
    )
  })

  test('returns "200 OK" with JSON body', async () => {
    // Arrange
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
    ]
    fetchMock.mockResolvedValue(songs)
    context.bindingData.series = 1

    // Act
    const result = await searchSong(context, { query: {} })

    // Assert
    expect(fetchMock).toBeCalledWith(undefined, 1)
    expect(result.status).toBe(200)
    expect(result.body).toBe(songs)
  })
})
