import type { Database } from '@ddradar/core'

import { fetchList } from './database'

/**
 * Returns score summaries grouped by playStyle and level.
 * @param userId User id
 */
export async function fetchClearAndScoreStatus(
  userId: string
): Promise<(Database.ClearStatusSchema | Database.ScoreStatusSchema)[]> {
  return fetchList(
    'UserDetails',
    '*',
    [
      { condition: 'c.userId = @', value: userId },
      { condition: 'c.type = "clear" OR c.type = "score"' },
    ],
    { _ts: 'ASC' }
  ) as Promise<(Database.ClearStatusSchema | Database.ScoreStatusSchema)[]>
}
