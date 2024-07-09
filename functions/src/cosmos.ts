import { CosmosClient } from '@azure/cosmos'
import type {
  ScoreSchema,
  UserClearLampSchema,
  UserRankSchema,
} from '@ddradar/core'

const client = new CosmosClient(process.env.COSMOS_DB_CONN!)

export async function getScores(songId: string) {
  const { resources } = await client
    .database('DDRadar')
    .container('Scores')
    .items.query<ScoreSchema>({
      query: `SELECT * FROM c WHERE c.songId = @id`,
      parameters: [{ name: '@id', value: songId }],
    })
    .fetchAll()
  return resources
}

export async function getUserDetails(userId: string) {
  const { resources } = await client
    .database('DDRadar')
    .container('UserDetails')
    .items.query<UserClearLampSchema | UserRankSchema>({
      query:
        'SELECT * FROM c WHERE c.userId = @userId AND c.type IN ("clear", "score")',
      parameters: [{ name: '@userId', value: userId }],
    })
    .fetchAll()
  return resources
}

export async function getTotalChartCounts() {
  const { resources } = await client
    .database('DDRadar')
    .container('Songs')
    .items.query<Pick<UserClearLampSchema, 'level' | 'playStyle' | 'count'>>(
      'SELECT c.playStyle, c.level, COUNT(1) AS count ' +
        'FROM s JOIN c IN s.charts ' +
        'WHERE s.nameIndex NOT IN (-1, -2) AND NOT (IS_DEFINED(s.deleted) AND s.deleted = true) ' +
        'GROUP BY c.playStyle, c.level'
    )
    .fetchAll()
  return resources
}
