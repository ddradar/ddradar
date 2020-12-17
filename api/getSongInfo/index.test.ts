import type { Context } from '@azure/functions'

import { testSongData } from '../core/__tests__/data'
import getSongInfo from '.'

describe('GET /api/v1/songs', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  const song = { ...testSongData }
  beforeEach(() => (context.bindingData = {}))

  test(`returns "200 OK" with JSON if documents contain 1 song`, async () => {
    // Arrange
    context.bindingData.id = song.id

    // Act
    const result = await getSongInfo(context, null, [song])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(song)
  })

  test(`returns "404 Not Found" if documents is []`, async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    const result = await getSongInfo(context, null, [])

    // Assert
    expect(result.status).toBe(404)
    expect(result.body).toMatch(/"foo"/)
  })
})
