import type { SongSchema } from '../db/songs'
import searchSong from '.'

describe('GET /api/v1/songs/series/{series}', () => {
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
  beforeEach(() => (req.query = {}))

  test('returns "200 OK" with JSON body', async () => {
    // Arrange - Act
    const result = await searchSong(null, req, songs)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual(songs)
  })

  test.each([
    ['25', [songs[0]]],
    ['28', [songs[1]]],
  ])('?series=%s returns "200 OK" with %p', async (name, expected) => {
    // Arrange
    req.query.name = name

    // Act
    const result = await searchSong(null, req, songs)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual(expected)
  })

  test('?series=1 returns "404 Not Found"', async () => {
    // Arrange
    req.query.name = '1'

    // Act
    const result = await searchSong(null, req, songs)

    // Assert
    expect(result.status).toBe(404)
  })

  test('returns "404 Not Found" if songs is empty', async () => {
    // Arrange - Act
    const result = await searchSong(null, req, [])

    // Assert
    expect(result.status).toBe(404)
  })
})
