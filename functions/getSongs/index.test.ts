import { testSongData } from '@ddradar/core/__tests__/data'

import getSongs from '.'

describe('GET /api/v1/songs', () => {
  test(`returns "200 OK" with JSON`, async () => {
    // Arrange
    const songs = [{ ...testSongData }]

    // Act
    const result = await getSongs(null, null, songs)

    // Assert
    expect(result).toStrictEqual({ status: 200, body: songs })
  })
})
