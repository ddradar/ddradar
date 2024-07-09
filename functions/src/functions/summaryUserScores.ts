import type { ItemDefinition } from '@azure/cosmos'
import type { CosmosDBOutput, InvocationContext } from '@azure/functions'
import { app } from '@azure/functions'
import type {
  ScoreSchema,
  UserClearLampSchema,
  UserRankSchema,
} from '@ddradar/core'

import { getUserDetails } from '../cosmos.js'

const $return: CosmosDBOutput = {
  name: '$return',
  type: 'cosmosDB',
  direction: 'out',
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'UserDetails',
}
app.cosmosDB('summaryUserScores', {
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'Scores',
  leaseCollectionPrefix: 'updateScores',
  createLeaseCollectionIfNotExists: true,
  return: $return,
  handler,
})

type UserDetailSchema = UserClearLampSchema | UserRankSchema

/**
 * Summary user scores for User details.
 * @param documents Change feed from "Scores" container.
 * @param ctx Function context
 */
export async function handler(
  documents: unknown[],
  ctx: InvocationContext
): Promise<UserDetailSchema[]> {
  const scores = documents as (ScoreSchema & ItemDefinition)[]
  const userScores = scores.reduce(
    (prev, s) => {
      if (!prev[s.userId]) prev[s.userId] = []
      prev[s.userId].push(s)
      return prev
    },
    {} as Record<string, (ScoreSchema & ItemDefinition)[]>
  )

  const result: UserDetailSchema[] = []
  for (const [userId, scores] of Object.entries(userScores)) {
    const summaries = await getUserDetails(userId)
    // Count up/down Clear/Score status
    for (const score of scores) {
      const clear = summaries.find(
        s =>
          s.type === 'clear' &&
          s.playStyle === score.playStyle &&
          s.level === score.level &&
          s.clearLamp === score.clearLamp
      )
      const rank = summaries.find(
        s =>
          s.type === 'score' &&
          s.playStyle === score.playStyle &&
          s.level === score.level &&
          s.rank === score.rank
      )
      // Deleted Score
      if ((score.ttl ?? -1) > 0) {
        if (clear) clear.count--
        if (rank) rank.count--
        continue
      }

      // Added Score
      if (clear) clear.count++
      else {
        ctx.info(
          `Created: { userId: "${userId}", playStyle: ${score.playStyle}, level: ${score.level}, clearLamp: ${score.clearLamp} }`
        )
        summaries.push({
          userId,
          type: 'clear',
          playStyle: score.playStyle,
          level: score.level,
          clearLamp: score.clearLamp,
          count: 1,
        })
      }
      if (rank) rank.count++
      else {
        ctx.info(
          `Created: { userId: "${userId}", playStyle: ${score.playStyle}, level: ${score.level}, rank: ${score.rank} }`
        )
        summaries.push({
          userId,
          type: 'score',
          playStyle: score.playStyle,
          level: score.level,
          rank: score.rank,
          count: 1,
        })
      }
    }
    result.push(...summaries)
  }
  return result
}
