import { and, eq, exists } from 'drizzle-orm'
import * as z from 'zod/mini'

import { ignoreTimestampCols } from '~~/server/db/utils'

const _querySchema = z.object({
  /** Song name index (0-36) */
  name: z.catch(
    z.optional(z.coerce.number().check(z.int(), z.minimum(0), z.maximum(36))),
    undefined
  ),
  /**
   * Series index
   * @description
   * - 0: DDR 1st
   * - 1: DDR 2ndMIX
   * - ...
   * - 19: DDR A3
   * - 20: DDR WORLD
   */
  series: z.catch(
    z.optional(
      z.coerce
        .number()
        .check(z.int(), z.minimum(0), z.maximum(seriesList.length - 1))
    ),
    undefined
  ),
  /**
   * Play style (`1`: SINGLE, `2`: DOUBLE)
   * @summary Ignored if `level` is not specified.
   */
  style: z.catch(
    z.optional(z.coerce.number().check(z.int(), z.minimum(1), z.maximum(2))),
    undefined
  ),
  /**
   * Chart level (1-20)
   * @summary Ignored if `style` is not specified.
   */
  level: z.catch(
    z.optional(z.coerce.number().check(z.int(), z.minimum(1), z.maximum(20))),
    undefined
  ),
  /**
   * Whether to include charts data
   * @default false when no chart conditions (`style` and `level`) specified, true when they are specified
   */
  includeCharts: z.catch(z.coerce.boolean(), false),
})

export default eventHandler(async event => {
  const query = await getValidatedQuery(event, _querySchema.parse)

  const hasChartConditions =
    query.style !== undefined && query.level !== undefined
  const includeCharts = hasChartConditions || query.includeCharts
  const conditions = []
  if (query.name !== undefined)
    conditions.push(eq(schema.songs.nameIndex, query.name))
  if (query.series !== undefined)
    conditions.push(eq(schema.songs.series, seriesList[query.series]))
  if (hasChartConditions) {
    conditions.push(
      exists(
        db
          .select()
          .from(schema.charts)
          .where(
            and(
              eq(schema.charts.id, schema.songs.id),
              eq(schema.charts.playStyle, query.style!),
              eq(schema.charts.level, query.level!)
            )
          )
      )
    )
  }

  const res = await db.query.songs.findMany({
    columns: { ...ignoreTimestampCols },
    where: and(...conditions),
    with: {
      charts: includeCharts
        ? {
            columns: { playStyle: true, difficulty: true, level: true },
          }
        : undefined,
    },
  })
  return res.sort(compareSong) as (Song & {
    charts?: Pick<StepChart, 'playStyle' | 'difficulty' | 'level'>[]
  })[]
})
