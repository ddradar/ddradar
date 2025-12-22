import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import { handler } from '~~/server/api/songs/[id]/index.get'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'

describe('GET /api/songs/[id]', () => {
  const mockData: Awaited<ReturnType<typeof handler>> = {
    ...testSongData,
    charts: [...testStepCharts],
  }

  const findFirst = vi.fn<typeof db.query.songs.findFirst>()
  const originalQuery = vi.mocked(db).query

  beforeAll(() => (vi.mocked(db).query = { songs: { findFirst } } as never))
  beforeEach(() => findFirst.mockClear())
  afterAll(() => (vi.mocked(db).query = originalQuery))

  test(`(id: '${testSongData.id}') returns song with charts (found in DB)`, async () => {
    // Arrange
    findFirst.mockResolvedValue(mockData as never)
    const event = {
      context: { params: { id: testSongData.id } },
    } as unknown as H3Event

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toEqual(mockData)
    expect(findFirst).toHaveBeenCalledTimes(1)
    const arg = findFirst.mock.calls[0]?.[0]
    expect(arg?.where).toStrictEqual(eq(schema.songs.id, testSongData.id))
  })
  test(`(id: '00000000000000000000000000000000') throws 404 (not found in DB)`, async () => {
    // Arrange
    const id = '00000000000000000000000000000000'
    findFirst.mockResolvedValue(undefined)
    const event = { context: { params: { id } } } as unknown as H3Event

    // Act & Assert
    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Not Found',
    })
    expect(findFirst).toHaveBeenCalledTimes(1)
    const arg = findFirst.mock.calls[0]?.[0]
    expect(arg?.where).toStrictEqual(eq(schema.songs.id, id))
  })
  test.each(['', 'invalid-id', null])('(id: %o) throws 400', async id => {
    // Arrange
    findFirst.mockResolvedValue(mockData as never)
    const event = { context: { params: { id } } } as unknown as H3Event

    // Act & Assert
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 })
    expect(findFirst).not.toHaveBeenCalled()
  })
})
