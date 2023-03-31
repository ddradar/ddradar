import type {
  UserClearLampSchema,
  UserRankSchema,
} from '@ddradar/db-definitions'

import { fetchList } from './database'

/**
 * Returns score summaries grouped by playStyle and level.
 * @param userId User id
 */
export async function fetchClearAndScoreStatus(
  userId: string
): Promise<(UserClearLampSchema | UserRankSchema)[]> {
  return fetchList('UserDetails', '*', [
    { condition: 'c.userId = @', value: userId },
    { condition: 'c.type = "clear" OR c.type = "score"' },
  ]) as Promise<(UserClearLampSchema | UserRankSchema)[]>
}
