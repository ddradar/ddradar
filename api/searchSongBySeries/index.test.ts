import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { fetchSongList, SongSchema } from '../db/songs'
import searchSong from '.'

jest.mock('../db/songs')

describe('GET /api/v1/songs/series', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  const req: { query: Record<string, string> } = { query: {} }
  const songs: Omit<SongSchema, 'charts'>[] = [
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
  beforeEach(() => {
    context.bindingData = {}
    req.query = {}
    mocked(fetchSongList).mockClear()
    mocked(fetchSongList).mockResolvedValue(songs)
  })

  test('/10 calls fetchSongList(undefined, 10)', async () => {
    // Arrange
    context.bindingData.series = 10

    // Act
    const result = await searchSong(context, req)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(songs)
    expect(mocked(fetchSongList)).toBeCalledWith(undefined, 10)
  })

  test.each([
    ['25', 25],
    ['28', 28],
  ])('/10&series=%s calls fetchSongList(%i, 10)', async (name, expected) => {
    // Arrange
    context.bindingData.series = 10
    req.query.name = name

    // Act
    await searchSong(context, req)

    // Assert
    expect(mocked(fetchSongList)).toBeCalledWith(expected, 10)
  })

  test('/30 returns "404 Not Found" if fetchSongList(undefined, 30) returns []', async () => {
    // Arrange
    context.bindingData.series = 30
    mocked(fetchSongList).mockResolvedValueOnce([])

    // Act
    const result = await searchSong(context, req)

    // Assert
    expect(result.status).toBe(404)
    expect(mocked(fetchSongList)).toBeCalledWith(undefined, 30)
  })
})
