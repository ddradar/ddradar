import type { Database } from '@ddradar/core'

import { getContainer } from './database'

type TotalCount = Pick<
  Database.ClearStatusSchema,
  'level' | 'playStyle' | 'count'
>

/** Returns {@link Database.StepChartSchema} count grouped by playStyle, level. */
export async function fetchTotalChartCount(): Promise<TotalCount[]> {
  const container = getContainer('Songs')
  const { resources } = await container.items
    .query<TotalCount>({
      query:
        'SELECT c.playStyle, c.level, COUNT(1) AS count ' +
        'FROM s JOIN c IN s.charts ' +
        'WHERE s.nameIndex NOT IN (-1, -2) AND NOT (IS_DEFINED(s.deleted) AND s.deleted = true) ' +
        'GROUP BY c.playStyle, c.level',
    })
    .fetchAll()
  return resources
}