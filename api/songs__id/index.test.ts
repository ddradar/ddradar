import type { Context } from '@azure/functions'
import { testSongData } from '@ddradar/core/__tests__/data'
import { beforeEach, describe, expect, test } from 'vitest'

import getSongInfo from '.'

describe('GET /api/v1/songs/{id}', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  const song = { ...testSongData }
  beforeEach(() => {
    context.bindingData = {}
  })

  test(`returns "404 Not Found" if no song that matches id.`, async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    const result = await getSongInfo(context, null, [])

    // Assert
    expect(result.status).toBe(404)
  })

  test(`returns "200 OK" with JSON if found.`, async () => {
    // Arrange
    context.bindingData.id = song.id

    // Act
    const result = await getSongInfo(context, null, [song])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(song)
  })
})
