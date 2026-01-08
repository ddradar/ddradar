import type { H3Event } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/songs/[id]/index.get'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'

describe('GET /api/songs/[id]', () => {
  const mockData: SongInfo = {
    ...testSongData,
    charts: [...testStepCharts],
  }

  beforeEach(() => vi.mocked(getCachedSongInfo).mockClear())

  test(`(id: '${testSongData.id}') returns song with charts (found in DB or cache)`, async () => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(mockData)
    const id = testSongData.id
    const event: Partial<H3Event> = { context: { params: { id } } }

    // Act
    const result = await handler(event as H3Event)

    // Assert
    expect(result).toStrictEqual(mockData)
    expect(vi.mocked(getCachedSongInfo)).toHaveBeenNthCalledWith(1, event, id)
  })

  test(`(id: '00000000000000000000000000000000') throws 404 (not found in DB)`, async () => {
    // Arrange
    const id = '00000000000000000000000000000000'
    vi.mocked(getCachedSongInfo).mockResolvedValue(undefined)
    const event: Partial<H3Event> = { context: { params: { id } } }

    // Act & Assert
    await expect(handler(event as H3Event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Not Found',
    })
    expect(vi.mocked(getCachedSongInfo)).toHaveBeenNthCalledWith(1, event, id)
  })

  test.each(['', 'invalid-id'])('(id: %o) throws 400', async id => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(mockData)
    const event: Partial<H3Event> = { context: { params: { id } } }

    // Act & Assert
    await expect(handler(event as H3Event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(getCachedSongInfo)).not.toHaveBeenCalled()
  })
})
