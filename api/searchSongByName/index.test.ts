import type { SongSchema } from '../db/songs'
import searchSong from '.'

describe('GET /api/v1/songs/name/{name}', () => {
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
  beforeEach(() => (req.query = {}))

  test('returns "200 OK" with JSON body', async () => {
    // Arrange - Act
    const result = await searchSong(null, req, songs)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual(songs)
  })

  test.each([
    ['0', [songs[0]]],
    ['10', [songs[1]]],
  ])('?series=%s returns "200 OK" with %p', async (series, expected) => {
    // Arrange
    req.query.series = series

    // Act
    const result = await searchSong(null, req, songs)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual(expected)
  })

  test('?series=9 returns "404 Not Found"', async () => {
    // Arrange
    req.query.series = '9'

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
