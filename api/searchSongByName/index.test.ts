import { testSongList } from '../__tests__/data'
import searchSong from '.'

describe('GET /api/v1/songs/name/{name}', () => {
  const req: { query: Record<string, string> } = { query: {} }
  const songs = testSongList.filter(s => s.nameIndex === 25)
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
