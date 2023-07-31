import type { ItemDefinition } from '@azure/cosmos'
import type {
  CosmosDBInput,
  CosmosDBOutput,
  InvocationContext,
} from '@azure/functions'
import { app } from '@azure/functions'
import type { UserClearLampSchema, UserRankSchema } from '@ddradar/core'
import { fetchSummaryClearLampCount, fetchSummaryRankCount } from '@ddradar/db'

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
  extraInputs: [input],
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
  const newClearLampCounts = await fetchSummaryClearLampCount()
  const newRankCounts = await fetchSummaryRankCount()
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
