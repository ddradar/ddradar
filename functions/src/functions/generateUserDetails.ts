import type { ItemDefinition } from '@azure/cosmos'
import type {
  CosmosDBInput,
  CosmosDBOutput,
  InvocationContext,
} from '@azure/functions'
import { app } from '@azure/functions'
import type { UserClearLampSchema, UserRankSchema } from '@ddradar/core'

const input: CosmosDBInput = {
  name: 'oldSummeries',
  type: 'cosmosDB',
  direction: 'in',
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'UserDetails',
  sqlQuery:
    "SELECT * FROM c WHERE c.userId <> '0' AND c.type IN ('clear', 'score')",
}
const lamps: CosmosDBInput = {
  name: 'newClearLampCounts',
  type: 'cosmosDB',
  direction: 'in',
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'Scores',
  sqlQuery: `
    SELECT c.userId, c.playStyle, c.level, "clear" AS type, c.clearLamp, COUNT(1) AS count
    FROM c
    WHERE
      IS_DEFINED(c.radar)
      AND ((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)
      AND NOT (IS_DEFINED(c.deleted) AND c.deleted = true)
    GROUP BY c.userId, c.playStyle, c.level, c.clearLamp`,
}
const ranks: CosmosDBInput = {
  name: 'newRankCounts',
  type: 'cosmosDB',
  direction: 'in',
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'Scores',
  sqlQuery: `
    SELECT c.userId, c.playStyle, c.level, "score" AS type, c.rank, COUNT(1) AS count
    FROM c
    WHERE
      IS_DEFINED(c.radar)
      AND ((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)
      AND NOT (IS_DEFINED(c.deleted) AND c.deleted = true)
    GROUP BY c.userId, c.playStyle, c.level, c.rank`,
}
const $return: CosmosDBOutput = {
  name: '$return',
  type: 'cosmosDB',
  direction: 'out',
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'UserDetails',
}
app.timer('generateUserDetails', {
  schedule: '0 0 20 * * *',
  extraInputs: [input, lamps, ranks],
  return: $return,
  handler,
})

type UserDetailSchema = (UserClearLampSchema | UserRankSchema) & ItemDefinition

/**
 * Update "UserDetails" container from "Scores" data summaries.
 * @param _ Timer object (not use)
 * @param ctx Function context
 */
export async function handler(
  _: unknown,
  ctx: InvocationContext
): Promise<UserDetailSchema[]> {
  const oldSummeries = ctx.extraInputs.get(input) as UserDetailSchema[]
  const newClearLampCounts = ctx.extraInputs.get(lamps) as UserClearLampSchema[]
  const newRankCounts = ctx.extraInputs.get(ranks) as UserRankSchema[]
  const notExists = oldSummeries.filter(
    o =>
      !newClearLampCounts.find(
        d =>
          o.userId === d.userId &&
          o.type === d.type &&
          o.playStyle === d.playStyle &&
          o.level === d.level &&
          o.clearLamp === d.clearLamp
      ) &&
      !newRankCounts.find(
        d =>
          o.userId === d.userId &&
          o.type === d.type &&
          o.playStyle === d.playStyle &&
          o.level === d.level &&
          o.rank === d.rank
      )
  )

  return [
    ...newClearLampCounts.map(
      d =>
        ({
          id: oldSummeries.find(
            o =>
              o.userId === d.userId &&
              o.type === d.type &&
              o.playStyle === d.playStyle &&
              o.level === d.level &&
              o.clearLamp === d.clearLamp
          )?.id,
          ...d,
        }) as UserClearLampSchema
    ),
    ...newRankCounts.map(
      d =>
        ({
          id: oldSummeries.find(
            o =>
              o.userId === d.userId &&
              o.type === d.type &&
              o.playStyle === d.playStyle &&
              o.level === d.level &&
              o.rank === d.rank
          )?.id,
          ...d,
        }) as UserRankSchema
    ),
    ...notExists.map(d => ({ ...d, count: 0 })),
  ]
}
