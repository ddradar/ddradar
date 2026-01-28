import { db } from '@nuxthub/db'
import { charts, songs } from '@nuxthub/db/schema'
import type { H3Event } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/songs/index.post'
import { notValidObject } from '~~/test/data/schema'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'

describe('POST /api/songs', () => {
  const adminUser = { id: 'admin', roles: ['admin'] }
  const validBody: Omit<SongInfo, 'nameIndex' | 'seriesCategory'> & {
    deletedAt?: Date | null
  } = {
    id: testSongData.id,
    name: testSongData.name,
    nameKana: testSongData.nameKana,
    artist: testSongData.artist,
    series: testSongData.series,
    bpm: testSongData.bpm,
    charts: [...testStepCharts],
  }

  beforeEach(() => {
    vi.mocked(requireAuthenticatedUser).mockClear()
    vi.mocked(clearSongCache).mockClear()
    vi.mocked(db.batch).mockClear()
    vi.mocked(db.insert).mockClear()
  })

  test.each([
    { id: 'user1', roles: [] },
    { id: 'user2', roles: ['foo'] },
  ])(
    '(%o (non-admin user)) returns 403 Forbidden',
    async (user: Awaited<ReturnType<typeof requireAuthenticatedUser>>) => {
      // Arrange
      vi.mocked(requireAuthenticatedUser).mockResolvedValueOnce(user)
      const event = {
        method: 'POST',
        node: {
          req: {
            body: JSON.stringify(validBody),
            headers: { 'content-type': 'application/json' },
          },
        },
      } as unknown as H3Event

      // Act - Assert
      await expect(handler(event)).rejects.toMatchObject({
        statusCode: 403,
        statusMessage: 'Forbidden',
      })
      expect(vi.mocked(db.insert)).not.toHaveBeenCalled()
      expect(vi.mocked(clearSongCache)).not.toHaveBeenCalled()
    }
  )

  test.each([
    ...notValidObject,
    { ...validBody, id: 'foo' },
    { ...validBody, charts: 'invalid' },
    { ...validBody, charts: [null] },
    { ...validBody, deletedAt: 'invalid' },
  ])('(%o (with admin user)) returns 400 Bad Request', async body => {
    // Arrange
    vi.mocked(requireAuthenticatedUser).mockResolvedValueOnce(adminUser)
    const event = {
      method: 'POST',
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      },
    } as unknown as H3Event

    // Act - Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(db.insert)).not.toHaveBeenCalled()
    expect(vi.mocked(clearSongCache)).not.toHaveBeenCalled()
  })

  test.each([validBody, { ...validBody, deletedAt: new Date().toISOString() }])(
    '(%o (with admin user)) returns 200',
    async body => {
      // Arrange
      vi.mocked(requireAuthenticatedUser).mockResolvedValueOnce(adminUser)
      const event: Partial<H3Event> = {
        method: 'POST',
        node: {
          req: {
            body: JSON.stringify(body),
            headers: { 'content-type': 'application/json' },
          },
        } as never,
      }

      // Act
      const result = await handler(event as H3Event)

      // Assert
      expect(result).toStrictEqual(body)
      expect(vi.mocked(db.insert)).toHaveBeenNthCalledWith(1, songs)
      expect(vi.mocked(db.insert)).toHaveBeenNthCalledWith(
        body.charts.length,
        charts
      )
      expect(vi.mocked(db.batch)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(clearSongCache)).toHaveBeenNthCalledWith(1, body.id)
    }
  )
})
