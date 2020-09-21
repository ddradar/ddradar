import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { fetchSongList, SongSchema } from '../db/songs'
import searchSong from '.'

jest.mock('../db/songs', () => ({
  ...jest.genMockFromModule<Record<string, unknown>>('../db/songs'),
  SeriesList: jest.requireActual('../db/songs').SeriesList,
}))

describe('GET /api/v1/songs/name', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  const req: { query: Record<string, string> } = { query: {} }
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
  ]
  beforeEach(() => {
    context.bindingData = {}
    req.query = {}
    mocked(fetchSongList).mockClear()
    mocked(fetchSongList).mockResolvedValue(songs)
  })

  test('/25 calls fetchSongList(25, undefined)', async () => {
    // Arrange
    context.bindingData.name = 25

    // Act
    const result = await searchSong(context, req)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(songs)
    expect(mocked(fetchSongList)).toBeCalledWith(25, undefined)
  })

  test.each([
    ['0', 0],
    ['10', 10],
  ])('/25&series=%s calls fetchSongList(25, %i)', async (series, expected) => {
    // Arrange
    context.bindingData.name = 25
    req.query.series = series

    // Act
    await searchSong(context, req)

    // Assert
    expect(mocked(fetchSongList)).toBeCalledWith(25, expected)
  })

  test('/30 returns "404 Not Found" if fetchSongList(30) returns []', async () => {
    // Arrange
    context.bindingData.name = 30
    mocked(fetchSongList).mockResolvedValueOnce([])

    // Act
    const result = await searchSong(context, req)

    // Assert
    expect(result.status).toBe(404)
    expect(mocked(fetchSongList)).toBeCalledWith(30, undefined)
  })
})
