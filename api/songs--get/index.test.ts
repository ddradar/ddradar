import { testSongList } from '@ddradar/core/__tests__/data'

import searchSong from '.'

describe('GET /api/v1/songs', () => {
  const req: { query: Record<string, string> } = { query: {} }
  const songs = [...testSongList]
  beforeEach(() => (req.query = {}))

  test.each([
    ['', '', [songs[0], songs[1], songs[2]]],
    ['25', '', [songs[0], songs[1]]],
    ['', '10', [songs[1], songs[2]]],
    ['25', '0', [songs[0]]],
  ])(
    '?name=%s&series=%s returns "200 OK" with %p',
    async (name, series, expected) => {
      // Arrange
      if (name) req.query.name = name
      if (series) req.query.series = series

      // Act
      const result = await searchSong(null, req, songs)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toStrictEqual(expected)
    }
  )

  test('?series=9 returns "404 Not Found"', async () => {
    // Arrange
    req.query.series = '9'

    // Act
    const result = await searchSong(null, req, songs)

    // Assert
    expect(result.status).toBe(404)
  })
})
