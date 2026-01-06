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

  const errorsOrWarnings: ScoreUpsertResult[] = []
  const targetScores: [number, ScoreRecordInput & ScoreRecord][] = []

  // Validate all scores first
  for (const [column, data] of body.entries()) {
    const chart = await getStepChart(data)
    if (!chart) {
      addWarningOrError('CHART_NOT_FOUND', column, data)
      continue
    }

    let scoreData = { ...data }
    if (hasNotesInfo(chart)) {
      // Fill missing properties from chart info
      scoreData = fillScoreRecordFromChart(chart, data)
    } else {
      // If chart notes info is missing, ignore exScore and maxCombo
      const fields = []
      if (data.exScore != null) {
        fields.push({
          field: 'exScore',
          message: 'Ignored because chart notes information is incomplete',
        })
      }
      if (data.maxCombo != null) {
        fields.push({
          field: 'maxCombo',
          message: 'Ignored because chart notes information is incomplete',
        })
      }
      if (fields.length > 0) {
        addWarningOrError('MISSING_CHART_NOTES', column, data, undefined, {
          fields,
        })
      }
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
      continue
    }

    targetScores.push([column, scoreData])
  }

  // Get db and schema references to avoid repeated imports in the loop
  const database = db
  const dbSchema = schema
  // Upsert all valid scores in batches
  for (const chunkScores of chunkArray(targetScores, CHUNK_SIZE)) {
    const results: ReadonlyArray<D1Result> = await database.batch(
      chunkScores.map(([, score]) =>
        database
          .insert(dbSchema.scores)
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
              dbSchema.scores.songId,
              dbSchema.scores.playStyle,
              dbSchema.scores.difficulty,
              dbSchema.scores.userId,
            ],
            set: {
              normalScore: sql`CASE WHEN ${or(isNotNull(dbSchema.scores.deletedAt), lt(dbSchema.scores.normalScore, score.normalScore))} THEN ${score.normalScore} ELSE ${dbSchema.scores.normalScore} END`,
              exScore: sql`CASE WHEN ${or(isNotNull(dbSchema.scores.deletedAt), lt(sql`COALESCE(${dbSchema.scores.exScore}, -1)`, score.exScore ?? -1))} THEN ${score.exScore ?? null} ELSE ${dbSchema.scores.exScore} END`,
              maxCombo: sql`CASE WHEN ${or(isNotNull(dbSchema.scores.deletedAt), lt(sql`COALESCE(${dbSchema.scores.maxCombo}, -1)`, score.maxCombo ?? -1))} THEN ${score.maxCombo ?? null} ELSE ${dbSchema.scores.maxCombo} END`,
              clearLamp: sql`CASE WHEN ${or(isNotNull(dbSchema.scores.deletedAt), lt(dbSchema.scores.clearLamp, score.clearLamp))} THEN ${score.clearLamp} ELSE ${dbSchema.scores.clearLamp} END`,
              rank: sql`CASE WHEN ${or(isNotNull(dbSchema.scores.deletedAt), lt(dbSchema.scores.normalScore, score.normalScore))} THEN ${score.rank} ELSE ${dbSchema.scores.rank} END`,
              flareRank: sql`CASE WHEN ${or(isNotNull(dbSchema.scores.deletedAt), lt(dbSchema.scores.flareRank, score.flareRank))} THEN ${score.flareRank} ELSE ${dbSchema.scores.flareRank} END`,
              flareSkill: sql`CASE WHEN ${or(isNotNull(dbSchema.scores.deletedAt), lt(sql`COALESCE(${dbSchema.scores.flareSkill}, -1)`, score.flareSkill ?? -1))} THEN ${score.flareSkill ?? null} ELSE ${dbSchema.scores.flareSkill} END`,
              deletedAt: null,
              updatedAt: new Date(),
            },
            setWhere: or(
              isNotNull(dbSchema.scores.deletedAt),
              lt(dbSchema.scores.normalScore, score.normalScore),
              lt(
                sql`COALESCE(${dbSchema.scores.exScore}, -1)`,
                score.exScore ?? -1
              ),
              lt(
                sql`COALESCE(${dbSchema.scores.maxCombo}, -1)`,
                score.maxCombo ?? -1
              ),
              lt(dbSchema.scores.clearLamp, score.clearLamp),
              lt(dbSchema.scores.flareRank, score.flareRank),
              lt(
                sql`COALESCE(${dbSchema.scores.flareSkill}, -1)`,
                score.flareSkill ?? -1
              )
            ),
          })
      ) as never
    )

    results.forEach((result, index) => {
      const [column] = chunkScores[index] as [number, ScoreRecordInput]
      const score = chunkScores[index]?.[1]
      if (score && !result.meta.changed_db) {
        addWarningOrError('LOWER_THAN_EXISTING', column, score)
      }
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
          BatchScoreRecord: {
            type: 'object',
            description: 'Score record to batch create or update',
            allOf: [
              {
                type: 'object',
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
                },
              },
              { $ref: '#/components/schemas/ScoreRecord', required: [] },
            ],
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
    security: [{ SessionCookieAuth: [] }, { BearerAuth: [] }],
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
                    'Array of errors or warnings for scores that were not updated or ignored some properties',
                  items: {
                    $ref: '#/components/schemas/BatchScoreUpsertResult',
                  },
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
