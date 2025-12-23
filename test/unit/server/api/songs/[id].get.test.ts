import type { H3Event } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/songs/[id]/index.get'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'

describe('GET /api/songs/[id]', () => {
  const mockData: Awaited<ReturnType<typeof handler>> = {
    ...testSongData,
    charts: [...testStepCharts],
  }
  beforeEach(() => vi.mocked(getCachedSongInfo).mockClear())

  test(`(id: '${testSongData.id}') returns song with charts (found in DB or cache)`, async () => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(mockData)
    const event = {
      context: { params: { id: testSongData.id } },
    } as unknown as H3Event

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toEqual(mockData)
    expect(vi.mocked(getCachedSongInfo)).toHaveBeenNthCalledWith(
      1,
      event,
      testSongData.id
    )
  })

  test(`(id: '00000000000000000000000000000000') throws 404 (not found in DB)`, async () => {
    // Arrange
    const id = '00000000000000000000000000000000'
    vi.mocked(getCachedSongInfo).mockResolvedValue(undefined)
    const event = { context: { params: { id } } } as unknown as H3Event

    // Act & Assert
    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Not Found',
    })
    expect(vi.mocked(getCachedSongInfo)).toHaveBeenNthCalledWith(1, event, id)
  })

  test.each(['', 'invalid-id', null])('(id: %o) throws 400', async id => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(mockData)
    const event = { context: { params: { id } } } as unknown as H3Event

    // Act & Assert
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 })
    expect(vi.mocked(getCachedSongInfo)).not.toHaveBeenCalled()
  })
})
