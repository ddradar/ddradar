import type { ItemDefinition } from '@azure/cosmos'

import type {
  ClearStatusSchema,
  ScoreStatusSchema,
} from '../core/db/userDetails'
import { fetchSummeryClearLampCount, fetchSummeryRankCount } from '../db/scores'

type UserDetailSchema = ClearStatusSchema | ScoreStatusSchema

export default async function (
  _context: unknown,
  _launchTimer: unknown,
  oldSummeries: (UserDetailSchema & ItemDefinition)[]
): Promise<UserDetailSchema[]> {
  const newClearLampCounts = await fetchSummeryClearLampCount()
  const newRankCounts = await fetchSummeryRankCount()

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
        } as ClearStatusSchema)
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
        } as ScoreStatusSchema)
    ),
  ]
}
