import type { ItemDefinition } from '@azure/cosmos'
import type { UserClearLampSchema, UserRankSchema } from '@ddradar/core'
import { fetchSummaryClearLampCount, fetchSummaryRankCount } from '@ddradar/db'

type UserDetailSchema = UserClearLampSchema | UserRankSchema

export default async function (
  _context: unknown,
  _launchTimer: unknown,
  oldSummeries: (UserDetailSchema & ItemDefinition)[]
): Promise<UserDetailSchema[]> {
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
        } as UserClearLampSchema)
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
        } as UserRankSchema)
    ),
    ...notExists.map(d => ({ ...d, count: 0 })),
  ]
}
