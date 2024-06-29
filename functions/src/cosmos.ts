import { CosmosClient } from '@azure/cosmos'
import type {
  PlayStyle,
  ScoreSchema,
  UserClearLampSchema,
  UserGrooveRadarSchema,
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

export async function getGrooveRadar(userId: string, playStyle: PlayStyle) {
  const { resources } = await client
    .database('DDRadar')
    .container('Scores')
    .items.query<UserGrooveRadarSchema>({
      query: `
      SELECT
        c.userId, c.playStyle, "radar" AS type,
        MAX(c.radar.stream) AS stream,
        MAX(c.radar.voltage) AS voltage,
        MAX(c.radar.air) AS air,
        MAX(c.radar.freeze) AS freeze,
        MAX(c.radar.chaos) AS chaos,
      FROM c
      WHERE c.userId = @userId
      AND c.playStyle = @playStyle
      AND IS_DEFINED(c.radar)
      AND ((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)
      GROUP BY c.userId, c.playStyle
      `,
      parameters: [
        { name: '@userId', value: userId },
        { name: '@playStyle', value: playStyle },
      ],
    })
    .fetchAll()
  return resources[0]
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
