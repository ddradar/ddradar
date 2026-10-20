import { describe, expect, test, vi } from 'vitest'

import handler from '#server/api/songs/[id]/index.get'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'
import { createRequestEvent } from '~~/test/unit/util'

describe('GET /api/songs/[id]', () => {
  const mockData: SongInfo = {
    ...testSongData,
    charts: [...testStepCharts],
  }

  test(`(id: '${testSongData.id}') returns song with charts (found in DB or cache)`, async () => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(mockData)
    const id = testSongData.id
    const event = createRequestEvent(null, { id })

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toStrictEqual(mockData)
    expect(vi.mocked(getCachedSongInfo)).toHaveBeenNthCalledWith(1, event, id)
  })

  test(`(id: '00000000000000000000000000000000') throws 404 (not found in DB)`, async () => {
    // Arrange
    const id = '00000000000000000000000000000000'
    vi.mocked(getCachedSongInfo).mockResolvedValue(undefined)
    const event = createRequestEvent(null, { id })

    // Act & Assert
    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Not Found',
    })
    expect(vi.mocked(getCachedSongInfo)).toHaveBeenNthCalledWith(1, event, id)
  })

  test.each(['', 'invalid-id'])('(id: %o) throws 400', async id => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(mockData)
    const event = createRequestEvent(null, { id })

    // Act & Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(getCachedSongInfo)).not.toHaveBeenCalled()
  })
})
