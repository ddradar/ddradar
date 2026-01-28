import { db } from '@nuxthub/db'
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

import { ClearLamp, FlareRank } from '#shared/schemas/score'
import { Difficulty, PlayStyle } from '#shared/schemas/step-chart'
import handler from '~~/server/api/me/scores/index.post'
import { getStepChart } from '~~/server/db/utils'
import { notValidObject } from '~~/test/data/schema'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'
import { publicUser, sessionUser } from '~~/test/data/user'

vi.mock('~~/server/db/utils', async () => {
  const actual = await vi.importActual('~~/server/db/utils')
  return {
    ...actual,
    getStepChart: vi.fn<typeof getStepChart>(),
  }
})

describe('POST /api/me/scores', () => {
  const score: ScoreRecordInput = {
    songId: testSongData.id,
    playStyle: testStepCharts[0].playStyle,
    difficulty: testStepCharts[0].difficulty,
    normalScore: 1000000,
    exScore:
      (testStepCharts[0].notes +
        testStepCharts[0].freezes +
        testStepCharts[0].shocks) *
      3,
    maxCombo: testStepCharts[0].notes + testStepCharts[0].shocks,
    clearLamp: ClearLamp.MFC,
    rank: 'AAA',
    flareRank: FlareRank.None,
    flareSkill: null,
  }

  beforeAll(() => {
    const user = { id: publicUser.id, roles: sessionUser.roles }
    vi.mocked(requireAuthenticatedUser).mockResolvedValue(user)
    vi.mocked(getStepChart).mockImplementation(async chart =>
      chart.songId === testSongData.id
        ? testStepCharts.find(
            c =>
              c.playStyle === chart.playStyle &&
              c.difficulty === chart.difficulty
          )
        : undefined
    )
  })
  beforeEach(() => {
    vi.mocked(db.insert).mockClear()
    vi.mocked(db.batch).mockClear()
    vi.mocked(getStepChart).mockClear()
  })
  afterAll(() => {
    vi.mocked(requireAuthenticatedUser).mockReset()
    vi.mocked(getStepChart).mockReset()
  })

  test.each([
    ...notValidObject,
    [],
    [{ ...score, songId: undefined }],
    [{ ...score, playStyle: undefined }],
    [{ ...score, difficulty: undefined }],
    [{ ...score, songId: 'invalid-id' }],
    [{ ...score, playStyle: PlayStyle.DOUBLE + 1 }],
    [{ ...score, difficulty: Difficulty.CHALLENGE + 1 }],
    [{ ...score, normalScore: -1 }],
    [{ ...score, normalScore: 1000001 }],
    [{ ...score, exScore: -1 }],
    [{ ...score, maxCombo: -1 }],
    [{ ...score, clearLamp: ClearLamp.MFC + 1 }],
    [{ ...score, rank: 'SSS' }],
  ])('(body %o) returns 400', async body => {
    // Arrange
    const event: Partial<H3Event> = {
      method: 'POST',
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(db.insert).not.toHaveBeenCalled()
  })

  test.each([
    [score, { count: 1, warnings: [] }, [{ meta: { changed_db: true } }]],
    [
      score,
      {
        count: 1,
        warnings: [expect.objectContaining({ reason: 'LOWER_THAN_EXISTING' })],
      },
      [{ meta: { changed_db: false } }], // simulate no DB change
    ],
    [
      {
        ...score,
        playStyle: testStepCharts[2].playStyle,
        difficulty: testStepCharts[2].difficulty,
        exScore: null,
        maxCombo: null,
      }, // testStepCharts[2] has no notes
      { count: 1, warnings: [] },
      [{ meta: { changed_db: true } }],
    ],
    [
      {
        ...score,
        playStyle: testStepCharts[2].playStyle,
        difficulty: testStepCharts[2].difficulty,
      }, // testStepCharts[2] has no notes, but exScore and maxCombo are provided
      {
        count: 1,
        warnings: [expect.objectContaining({ reason: 'MISSING_CHART_NOTES' })],
      },
      [{ meta: { changed_db: true } }],
    ],
    [
      { ...score, songId: '0'.repeat(32) }, // valid format, not in testStepCharts
      {
        count: 0,
        warnings: [expect.objectContaining({ reason: 'CHART_NOT_FOUND' })],
      },
      [],
    ],
    [
      {
        songId: testSongData.id,
        playStyle: testStepCharts[0].playStyle,
        difficulty: testStepCharts[0].difficulty,
        clearLamp: 2,
        rank: 'A',
        flareRank: 0,
      }, // normalScore missing and cannot be filled from chart
      {
        count: 0,
        warnings: [
          expect.objectContaining({ reason: 'MISSING_REQUIRED_PROPERTIES' }),
        ],
      },
      [],
    ],
    [
      { ...score, exScore: 9999, maxCombo: 9999 }, // too high
      {
        count: 0,
        warnings: [expect.objectContaining({ reason: 'VALIDATION_FAILED' })],
      },
      [],
    ],
  ])('(body %o) returns 200 with %o', async (score, expected, batchResult) => {
    // Arrange
    vi.mocked(db.batch).mockResolvedValue(batchResult)
    const event: Partial<H3Event> = {
      method: 'POST',
      node: {
        req: {
          body: JSON.stringify([score]),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act
    const result = await handler(event as H3Event)

    // Assert
    expect(result).toStrictEqual(expected)
    expect(db.insert).toHaveBeenCalledTimes(expected.count)
  })
})
