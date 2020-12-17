import { testSongData } from '../core/__tests__/data'
import postSongInfo from '.'

describe('POST /api/v1/admin/songs', () => {
  const validSong = { ...testSongData }

  test('returns "400 Bad Request" if body is empty', async () => {
    // Arrange
    const req = {}

    // Act
    const result = await postSongInfo(null, req)

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test.each([
    validSong,
    {
      ...validSong,
      charts: validSong.charts.sort((l, r) => l.difficulty - r.difficulty),
    },
    { ...validSong, foo: 'bar' },
  ])('returns "200 OK" with JSON body if body is %p', async body => {
    // Arrange - Act
    const result = await postSongInfo(null, { body })

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual(validSong)
    expect(result.document).toStrictEqual(validSong)
  })
})
