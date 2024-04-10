import type { ItemDefinition } from '@azure/cosmos'
import type { CosmosDBOutput, InvocationContext } from '@azure/functions'
import { app } from '@azure/functions'
import type {
  ScoreSchema,
  UserClearLampSchema,
  UserGrooveRadarSchema,
  UserRankSchema,
} from '@ddradar/core'

import { getGrooveRadar, getUserDetails } from '../cosmos'

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

type UserDetailSchema =
  | UserGrooveRadarSchema
  | UserClearLampSchema
  | UserRankSchema

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
      // Skip area top & course score
      if (!s.radar) return prev

      if (!prev[s.userId]) prev[s.userId] = []
      prev[s.userId].push(s)
      return prev
    },
    {} as Record<string, (ScoreSchema & ItemDefinition)[]>
  )

  const result: UserDetailSchema[] = []
  for (const [userId, scores] of Object.entries(userScores)) {
    // Regenerate Groove Radar
    result.push(
      await generateGrooveRadar(userId, 1),
      await generateGrooveRadar(userId, 2)
    )
    ctx.info(`Generated: { userId: "${userId}" } Groove Radar`)

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

  async function generateGrooveRadar(
    userId: string,
    playStyle: 1 | 2
  ): Promise<UserGrooveRadarSchema> {
    const resource = await getGrooveRadar(userId, playStyle)
    const result: UserGrooveRadarSchema & Pick<ItemDefinition, 'id'> =
      resource ?? {
        userId,
        type: 'radar',
        playStyle,
        stream: 0,
        voltage: 0,
        air: 0,
        freeze: 0,
        chaos: 0,
      }
    result.id = `radar-${userId}-${playStyle}`
    return result
  }
}
