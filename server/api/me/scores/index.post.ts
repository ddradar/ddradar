import type { D1Result } from '@cloudflare/workers-types'
import { isNotNull, lt, or, sql } from 'drizzle-orm'
import * as z from 'zod/mini'

import { getStepChart } from '~~/server/db/utils'
import { getReason, type ScoreUpsertResult } from '~~/server/utils/score-insert'
import { scoreRecordInputSchema } from '~~/shared/schemas/score'
import { chunkArray, isPropertyNotNull } from '~~/shared/utils'
import {
  fillScoreRecordFromChart,
  hasNotesInfo,
  ValidateScoreRecord,
} from '~~/shared/utils/score'

const _bodySchema = z.array(scoreRecordInputSchema).check(z.minLength(1))
const CHUNK_SIZE = 25
const requiredCols = ['normalScore', 'clearLamp', 'rank', 'flareRank'] as const

export default defineEventHandler(async event => {
  const { id: userId } = await requireAuthenticatedUser(event)

  const body = await readValidatedBody(event, _bodySchema.parse)

  let hasError = false
  const errorsOrWarnings: ScoreUpsertResult[] = []
  const targetScores: [number, ScoreRecordInput & ScoreRecord][] = []

  // Validate all scores first
  for (const [column, data] of body.entries()) {
    const chart = await getStepChart(data)
    if (!chart) {
      addWarningOrError('CHART_NOT_FOUND', column, data)
      hasError ||= true
      continue
    }

    let scoreData = { ...data }
    if (hasNotesInfo(chart)) {
      // Fill missing properties from chart info
      scoreData = fillScoreRecordFromChart(chart, data)
    } else {
      // If chart notes info is missing, ignore exScore and maxCombo
      addWarningOrError('MISSING_CHART_NOTES', column, data, undefined, {
        fields: [
          {
            field: 'exScore',
            message: 'Chart notes information is incomplete',
          },
          {
            field: 'maxCombo',
            message: 'Chart notes information is incomplete',
          },
        ],
      })
      scoreData.exScore = null
      scoreData.maxCombo = null
    }

    // Check required properties
    if (!isPropertyNotNull(scoreData, ...requiredCols)) {
      const missingFields = Object.entries(scoreData)
        .filter(([_, v]) => v == null)
        .map(([k]) => k)
      const message = `Missing required properties and cannot detect other properties: ${missingFields.join(', ')}`
      addWarningOrError('MISSING_REQUIRED_PROPERTIES', column, data, message, {
        fields: missingFields.map(field => ({
          field,
          message: 'Required property is missing and cannot be detected',
        })),
      })
      hasError ||= true
      continue
    }

    // Validate score values against chart
    const validationErrors = ValidateScoreRecord(chart, scoreData)
    if (validationErrors.length > 0) {
      const message = validationErrors
        .map(err => `${err.field}: ${err.message}`)
        .join('; ')
      addWarningOrError('VALIDATION_FAILED', column, data, message, {
        fields: validationErrors,
      })
      hasError ||= true
      continue
    }

    targetScores.push([column, scoreData])
  }

  if (hasError) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'One or more scores are invalid.',
      data: errorsOrWarnings,
    })
  }

  // Upsert all valid scores in chunks
  for (const chunkScores of chunkArray(targetScores, CHUNK_SIZE)) {
    const upserts = chunkScores.map(([, score]) =>
      db
        .insert(schema.scores)
        .values({
          songId: score.songId,
          playStyle: score.playStyle,
          difficulty: score.difficulty,
          userId,
          normalScore: score.normalScore,
          exScore: score.exScore,
          maxCombo: score.maxCombo,
          clearLamp: score.clearLamp,
          rank: score.rank,
          flareRank: score.flareRank,
          flareSkill: score.flareSkill,
          deletedAt: null,
        })
        .onConflictDoUpdate({
          target: [
            schema.scores.songId,
            schema.scores.playStyle,
            schema.scores.difficulty,
            schema.scores.userId,
          ],
          set: {
            normalScore: sql`CASE WHEN ${or(isNotNull(schema.scores.deletedAt), lt(schema.scores.normalScore, score.normalScore))} THEN ${score.normalScore} ELSE ${schema.scores.normalScore} END`,
            exScore: sql`CASE WHEN ${or(isNotNull(schema.scores.deletedAt), lt(sql`COALESCE(${schema.scores.exScore}, -1)`, score.exScore ?? -1))} THEN ${score.exScore ?? null} ELSE ${schema.scores.exScore} END`,
            maxCombo: sql`CASE WHEN ${or(isNotNull(schema.scores.deletedAt), lt(sql`COALESCE(${schema.scores.maxCombo}, -1)`, score.maxCombo ?? -1))} THEN ${score.maxCombo ?? null} ELSE ${schema.scores.maxCombo} END`,
            clearLamp: sql`CASE WHEN ${or(isNotNull(schema.scores.deletedAt), lt(schema.scores.clearLamp, score.clearLamp))} THEN ${score.clearLamp} ELSE ${schema.scores.clearLamp} END`,
            rank: sql`CASE WHEN ${or(isNotNull(schema.scores.deletedAt), lt(schema.scores.normalScore, score.normalScore))} THEN ${score.rank} ELSE ${schema.scores.rank} END`,
            flareRank: sql`CASE WHEN ${or(isNotNull(schema.scores.deletedAt), lt(schema.scores.flareRank, score.flareRank))} THEN ${score.flareRank} ELSE ${schema.scores.flareRank} END`,
            flareSkill: sql`CASE WHEN ${or(isNotNull(schema.scores.deletedAt), lt(sql`COALESCE(${schema.scores.flareSkill}, -1)`, score.flareSkill ?? -1))} THEN ${score.flareSkill ?? null} ELSE ${schema.scores.flareSkill} END`,
            deletedAt: null,
            updatedAt: new Date(),
          },
          setWhere: or(
            isNotNull(schema.scores.deletedAt),
            lt(schema.scores.normalScore, score.normalScore),
            lt(
              sql`COALESCE(${schema.scores.exScore}, -1)`,
              score.exScore ?? -1
            ),
            lt(
              sql`COALESCE(${schema.scores.maxCombo}, -1)`,
              score.maxCombo ?? -1
            ),
            lt(schema.scores.clearLamp, score.clearLamp),
            lt(schema.scores.flareRank, score.flareRank),
            lt(
              sql`COALESCE(${schema.scores.flareSkill}, -1)`,
              score.flareSkill ?? -1
            )
          ),
        })
    )
    const res: ReadonlyArray<D1Result> = await db.batch(upserts as never)
    res.forEach((result, index) => {
      const [column, score] = chunkScores[index] as [number, ScoreRecordInput]
      if (!result.meta.changed_db)
        addWarningOrError('LOWER_THAN_EXISTING', column, score)
    })
  }
  return { count: targetScores.length, warnings: errorsOrWarnings }

  function addWarningOrError(
    reason: ScoreUpsertResult['reason'],
    column: number,
    data: ScoreRecordInput,
    message?: string,
    details?: ScoreUpsertResult['details']
  ) {
    errorsOrWarnings.push(getReason(reason, column, data, message, details))
  }
})

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          ScoreRecord: {
            type: 'object',
            properties: {
              normalScore: {
                type: 'integer',
                description: 'Normal Score (0-1,000,000)',
                minimum: 0,
                maximum: 1000000,
              },
              exScore: {
                type: ['integer', 'null'],
                description: 'EX Score',
                minimum: 0,
              },
              maxCombo: {
                type: ['integer', 'null'],
                description: 'Max Combo',
                minimum: 0,
              },
              clearLamp: {
                type: 'integer',
                description:
                  'Clear Lamp (0: Failed, 1: Assisted Clear, 2: Clear, 3: Life 4 Clear, 4: Full Combo (Good FC), 5: Great Full Combo, 6: Perfect Full Combo, 7: Marvelous Full Combo)',
                enum: [0, 1, 2, 3, 4, 5, 6, 7],
                'x-enum-varnames': [
                  'Failed',
                  'Assisted_Clear',
                  'Clear',
                  'Life 4 Clear',
                  'Full Combo (Good FC)',
                  'Great Full Combo',
                  'Perfect Full Combo',
                  'Marvelous Full Combo',
                ],
              },
              rank: {
                type: 'string',
                description:
                  'Dance Level ("AAA", "AA+", "AA", "AA-", ..., "D+", "D", "E")',
                enum: [
                  'AAA',
                  'AA+',
                  'AA',
                  'AA-',
                  'A+',
                  'A',
                  'A-',
                  'B+',
                  'B',
                  'B-',
                  'C+',
                  'C',
                  'C-',
                  'D+',
                  'D',
                  'E',
                ],
              },
              flareRank: {
                type: 'integer',
                description:
                  'Flare Rank (0: No FLARE, 1: FLARE I, 2: FLARE II, 3: FLARE III, 4: FLARE IV, 5: FLARE V, 6: FLARE VI, 7: FLARE VII, 8: FLARE VIII, 9: FLARE IX, 10: FLARE EX)',
                enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                'x-enum-varnames': [
                  'No FLARE',
                  'FLARE I',
                  'FLARE II',
                  'FLARE III',
                  'FLARE IV',
                  'FLARE V',
                  'FLARE VI',
                  'FLARE VII',
                  'FLARE VIII',
                  'FLARE IX',
                  'FLARE EX',
                ],
              },
              flareSkill: {
                type: ['integer', 'null'],
                description: 'Flare Skill',
                minimum: 0,
              },
            },
            required: ['normalScore', 'clearLamp', 'rank', 'flareRank'],
          },
          BatchScoreRecord: {
            type: 'object',
            description: 'Score record to batch create or update',
            properties: {
              songId: {
                $ref: '#/components/schemas/Song/properties/id',
              },
              playStyle: {
                $ref: '#/components/schemas/StepChart/properties/playStyle',
              },
              difficulty: {
                $ref: '#/components/schemas/StepChart/properties/difficulty',
              },
              normalScore: {
                $ref: '#/components/schemas/ScoreRecord/properties/normalScore',
              },
              exScore: {
                $ref: '#/components/schemas/ScoreRecord/properties/exScore',
              },
              maxCombo: {
                $ref: '#/components/schemas/ScoreRecord/properties/maxCombo',
              },
              clearLamp: {
                $ref: '#/components/schemas/ScoreRecord/properties/clearLamp',
              },
              rank: {
                $ref: '#/components/schemas/ScoreRecord/properties/rank',
              },
              flareRank: {
                $ref: '#/components/schemas/ScoreRecord/properties/flareRank',
              },
              flareSkill: {
                $ref: '#/components/schemas/ScoreRecord/properties/flareSkill',
              },
            },
            required: ['songId', 'playStyle', 'difficulty'],
          },
          BatchScoreUpsertResult: {
            type: 'object',
            properties: {
              severity: {
                type: 'string',
                description: 'Severity of the issue',
                enum: ['error', 'warning'],
              },
              reason: {
                type: 'string',
                description: 'Reason code for the issue',
                enum: [
                  'CHART_NOT_FOUND',
                  'MISSING_CHART_NOTES',
                  'MISSING_REQUIRED_PROPERTIES',
                  'VALIDATION_FAILED',
                  'LOWER_THAN_EXISTING',
                ],
              },
              message: {
                type: 'string',
                description: 'Error or warning message (human-readable)',
              },
              column: {
                type: 'integer',
                description: 'Index of the score in the input array (0-based)',
              },
              data: {
                $ref: '#/components/schemas/BatchScoreRecord',
                description: 'The score data that caused the error or warning',
              },
              details: {
                type: 'object',
                description:
                  'Additional details about the issue (machine-readable)',
                properties: {
                  fields: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                          description: 'Name of the affected field',
                        },
                        message: {
                          type: 'string',
                          description: 'Error or warning message for the field',
                        },
                      },
                      required: ['field', 'message'],
                    },
                    description:
                      'List of fields that have issues and their messages',
                  },
                },
              },
            },
            required: ['severity', 'reason', 'message', 'column', 'data'],
          },
        },
      },
    },
    summary: 'Bulk create or update Score records',
    description:
      'Create or update multiple Score records for the authenticated user. If a score is lower than the existing one, it will not be updated.',
    tags: ['Score'],
    security: [{ SessionCookieAuth: [], BearerAuth: [] }],
    requestBody: {
      description: 'Array of Score records to create or update',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/BatchScoreRecord',
              description:
                'Score record to create or update (missing values will be filled from chart info, if possible)',
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Bulk score upsert result',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                count: {
                  type: 'integer',
                  description: 'Number of scores processed',
                },
                warnings: {
                  type: 'array',
                  description:
                    'Array of warnings for scores that were not updated or ignored some properties',
                  items: {
                    $ref: '#/components/schemas/BatchScoreUpsertResult',
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: 'Bad Request - One or more scores are invalid',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Error response for invalid scores',
              properties: {
                error: {
                  $ref: '#/components/schemas/ErrorResponse/properties/error',
                },
                url: {
                  $ref: '#/components/schemas/ErrorResponse/properties/url',
                },
                data: {
                  type: 'array',
                  description: 'Array of errors for invalid scores',
                  items: {
                    $ref: '#/components/schemas/BatchScoreUpsertResult',
                  },
                },
                statusCode: {
                  $ref: '#/components/schemas/ErrorResponse/properties/statusCode',
                },
                statusMessage: {
                  $ref: '#/components/schemas/ErrorResponse/properties/statusMessage',
                },
                message: {
                  $ref: '#/components/schemas/ErrorResponse/properties/message',
                },
                stack: {
                  $ref: '#/components/schemas/ErrorResponse/properties/stack',
                },
              },
            },
          },
        },
      },
      401: { $ref: '#/components/responses/Unauthorized' },
      403: { $ref: '#/components/responses/RegistrationRequired' },
    },
  },
})
