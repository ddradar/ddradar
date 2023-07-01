import type { OperationInput } from '@azure/cosmos'
import type { ScoreSchema } from '@ddradar/core'
import {
  createScoreSchema,
  isAreaUser,
  mergeScore,
  setValidScoreFromChart,
} from '@ddradar/core'

export const topUser = { id: '0', name: '0', isPublic: false } as const

export function upsertScore(
  chartInfo: Readonly<Parameters<typeof createScoreSchema>[0]>,
  user: Readonly<Parameters<typeof createScoreSchema>[1]>,
  oldScores: ScoreSchema[],
  score: Readonly<Parameters<typeof setValidScoreFromChart>[1]>,
  result: ScoreSchema[],
  operations: OperationInput[]
) {
  const oldScore = oldScores.find(
    d =>
      d.userId === user.id &&
      d.playStyle === chartInfo.playStyle &&
      d.difficulty === chartInfo.difficulty
  )
  const mergedScore = mergeScore(
    oldScore ?? { score: 0, rank: 'E', clearLamp: 0 },
    setValidScoreFromChart(chartInfo, score)
  )
  if (
    mergedScore.score === oldScore?.score &&
    mergedScore.clearLamp === oldScore.clearLamp &&
    mergedScore.exScore === oldScore.exScore &&
    mergedScore.maxCombo === oldScore.maxCombo &&
    mergedScore.rank === oldScore.rank
  ) {
    return
  }
  const newScore = createScoreSchema(chartInfo, user, mergedScore)
  if (!isAreaUser(user)) result.push(newScore)

  operations.push({ operationType: 'Create', resourceBody: newScore })
  if (oldScore) {
    operations.push({
      operationType: 'Patch',
      id: oldScore.id!,
      partitionKey: oldScore.userId,
      resourceBody: {
        operations: [{ op: 'add', path: '/ttl', value: 3600 }],
      },
    })
  }
}
