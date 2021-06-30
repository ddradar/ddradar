import { testSongList } from '@ddradar/core/__tests__/data'

import searchSong from '.'

describe('GET /api/v1/songs/series/{series}', () => {
  const req: { query: Record<string, string> } = { query: {} }
  const songs = testSongList.filter(s => s.series === 'DDR X')
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
  ])('?name=%s returns "200 OK" with %p', async (name, expected) => {
    // Arrange
    req.query.name = name

    // Act
    const result = await searchSong(null, req, songs)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual(expected)
  })

  test('?name=1 returns "404 Not Found"', async () => {
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
