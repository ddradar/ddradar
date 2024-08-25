import { InvocationContext } from '@azure/functions'
import { Lamp } from '@ddradar/core'
import { publicUser, testSongData } from '@ddradar/core/test/data'
import type { DBScoreSchema } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { getClient } from '../../src/cosmos.js'
import { handler } from '../../src/functions/updateSongInfo'

vi.mock('../../src/cosmos.js')

describe('/functions/updateSongInfo.ts', () => {
  const song = {
    id: testSongData.id,
    name: testSongData.name,
    seriesCategory: testSongData.seriesCategory,
    deleted: testSongData.deleted,
  }
  const chart = {
    playStyle: testSongData.charts[0].playStyle,
    difficulty: testSongData.charts[0].difficulty,
    level: testSongData.charts[0].level,
  }
  const client = {
    database: vi.fn().mockReturnThis(),
    container: vi.fn().mockReturnThis(),
    items: {
      getAsyncIterator: vi.fn(),
      query: vi.fn().mockReturnThis(),
    },
  }
  beforeEach(() => {
    vi.mocked(getClient).mockClear()
    client.items.getAsyncIterator.mockClear()
    client.items.query.mockClear()
  })

  test.each([
    [
      [
        {
          id: `${song.id}/${chart.playStyle}/${chart.difficulty}/0`,
          type: 'score',
          song: { ...song, name: 'test', deleted: false },
          chart: { ...chart, level: 1 },
          user: { id: '0', area: 0, name: '0', isPublic: false },
          score: 999620, // P:38
          clearLamp: Lamp.PFC,
          rank: 'AAA',
          maxCombo: 138,
          exScore: 376,
        },
        {
          id: `${song.id}/${chart.playStyle}/${chart.difficulty}/${publicUser.id}`,
          type: 'score',
          song: { ...song, name: 'test', deleted: false },
          chart: { ...chart, level: 1 },
          user: {
            id: publicUser.id,
            area: publicUser.area,
            isPublic: publicUser.isPublic,
            name: publicUser.name,
          },
          score: 970630, // P:28, Gr:10
          clearLamp: Lamp.GFC,
          rank: 'AA+',
          maxCombo: 138,
          exScore: 366,
        },
      ] satisfies DBScoreSchema[],
      [
        {
          id: `${song.id}/${chart.playStyle}/${chart.difficulty}/0`,
          type: 'score',
          song,
          chart,
          user: { id: '0', area: 0, name: '0', isPublic: false },
          score: 999620, // P:38
          clearLamp: Lamp.PFC,
          rank: 'AAA',
          maxCombo: 138,
          exScore: 376,
        },
        {
          id: `${testSongData.id}/${chart.playStyle}/${chart.difficulty}/${publicUser.id}`,
          type: 'score',
          song,
          chart,
          user: {
            id: publicUser.id,
            area: publicUser.area,
            isPublic: publicUser.isPublic,
            name: publicUser.name,
          },
          score: 970630, // P:28, Gr:10
          clearLamp: Lamp.GFC,
          rank: 'AA+',
          maxCombo: 138,
          exScore: 366,
        },
        {
          id: `${song.id}/${testSongData.charts[1].playStyle}/${testSongData.charts[1].difficulty}/0`,
          type: 'score',
          song,
          chart: {
            playStyle: testSongData.charts[1].playStyle,
            difficulty: testSongData.charts[1].difficulty,
            level: testSongData.charts[1].level,
          },
          user: { id: '0', area: 0, name: '0', isPublic: false },
          score: 0,
          clearLamp: Lamp.Failed,
          rank: 'E',
        },
      ] satisfies DBScoreSchema[],
    ],
  ])('returns {scores: [DBScoreSchema] }', async (resources, scores) => {
    // Arrange
    client.items.getAsyncIterator.mockImplementation(async function* () {
      yield { resources }
    })
    vi.mocked(getClient).mockReturnValue(
      client as unknown as ReturnType<typeof getClient>
    )
    const ctx = new InvocationContext()

    // Act
    const result = await handler([testSongData], ctx)

    expect(result).toStrictEqual({ scores })
  })
})
