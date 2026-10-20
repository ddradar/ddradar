import { db } from '@nuxthub/db'
import { charts, songs } from '@nuxthub/db/schema'
import { and, asc, eq, exists, inArray, isNull } from 'drizzle-orm'
import { getValidatedQuery } from 'h3'
import { defineCachedEventHandler } from 'nitropack/runtime'
import * as z from 'zod/mini'

import { ignoreTimestampCols } from '#server/db/utils'
import { buildPagenation } from '#server/utils/pagination'
import { NameIndex, seriesList } from '#shared/schemas/song'
import { stepChartSchema } from '#shared/schemas/step-chart'
import { singleOrArray } from '#shared/utils'

/** Schema for query parameters */
const querySchema = z.compile(
  z.object({
    /** Song name index (0-36) */
    name: z.catch(
      z.optional(singleOrArray(z.pipe(z.coerce.number(), z.enum(NameIndex)))),
      undefined
    ),
    /**
     * Series index
     * @description
     * - 0: DDR 1st
     * - 1: DDR 2ndMIX
     * - ...
     * - 18: DDR A3
     * - 19: DDR WORLD
     */
    series: z.catch(
      z.optional(
        singleOrArray(
          z.coerce
            .number()
            .check(z.int(), z.nonnegative(), z.lte(seriesList.length - 1))
        )
      ),
      undefined
    ),
    /** Play style (`1`: SINGLE, `2`: DOUBLE) */
    style: z.catch(
      z.optional(z.pipe(z.coerce.number(), stepChartSchema.shape.playStyle)),
      undefined
    ),
    /** Chart level (1-20) */
    level: z.catch(
      z.optional(
        singleOrArray(z.pipe(z.coerce.number(), stepChartSchema.shape.level))
      ),
      undefined
    ),
    /**
     * Whether to include charts data
     * @default false when no chart conditions (`style` and `level`) specified, true when they are specified
     */
    includeCharts: z.catch(z.stringbool(), false),
    /** Maximum number of items to return (default: 50, maximum: 100) */
    limit: z.catch(
      z.coerce.number().check(z.int(), z.positive(), z.maximum(100)),
      50
    ),
    /** Number of items to skip. use for pagination (default: 0) */
    offset: z.catch(z.coerce.number().check(z.int(), z.nonnegative()), 0),
  })
)

/** Cache name for "GET /api/songs" handler */
export const cacheName = 'getSongList'

export const getSongListCacheKey = async (
  event: Parameters<typeof getValidatedQuery>[0]
) => {
  const query = await getValidatedQuery(event, i => querySchema.parse(i))
  const hasChartConditions =
    query.style !== undefined || query.level !== undefined
  const withCharts = hasChartConditions || query.includeCharts

  const params: string[] = []
  function sortAndJoin(value: number | number[]) {
    return [value]
      .flat()
      .sort((l, r) => l - r)
      .join(',')
  }

  if (query.name !== undefined) params.push(`name=${sortAndJoin(query.name)}`)
  if (query.series !== undefined)
    params.push(`series=${sortAndJoin(query.series)}`)
  if (query.style !== undefined) params.push(`style=${query.style}`)
  if (query.level !== undefined)
    params.push(`level=${sortAndJoin(query.level)}`)
  if (query.offset > 0) params.push(`offset=${query.offset}`)
  if (query.limit !== 50) params.push(`limit=${query.limit}`)
  params.sort()
  const queryString = params.join('&') || 'all'
  return `${withCharts ? 'withCharts:' : ''}${queryString}`
}

/**
 * Get Song List
 */
export default defineCachedEventHandler(
  async event => {
    const query = await getValidatedQuery(event, i => querySchema.parse(i))

    const hasChartConditions =
      query.style !== undefined || query.level !== undefined
    const includeCharts = hasChartConditions || query.includeCharts

    // Build query conditions
    const conditions = [isNull(songs.deletedAt)]
    if (query.name !== undefined)
      conditions.push(inArray(songs.nameIndex, [query.name].flat()))
    if (query.series !== undefined)
      conditions.push(
        inArray(
          songs.series,
          [query.series].flat().map(i => seriesList[i]!)
        )
      )
    if (hasChartConditions) {
      const chartConditions = [
        eq(charts.id, songs.id),
        isNull(charts.deletedAt),
      ]
      if (query.style !== undefined)
        chartConditions.push(eq(charts.playStyle, query.style))
      if (query.level !== undefined)
        chartConditions.push(inArray(charts.level, [query.level].flat()))
      conditions.push(
        exists(
          db
            .select()
            .from(charts)
            .where(and(...chartConditions))
        )
      )
    }

    const items: SongSearchResult[] = await db.query.songs.findMany({
      columns: { ...ignoreTimestampCols },
      where: and(...conditions),
      with: {
        charts: includeCharts
          ? {
              columns: { playStyle: true, difficulty: true, level: true },
              where: (charts, { isNull }) => isNull(charts.deletedAt),
            }
          : undefined,
      },
      orderBy: [asc(songs.nameIndex), asc(songs.nameKana)],
      offset: query.offset,
      limit: query.limit + 1,
    })

    return buildPagenation(items, query.limit, query.offset)
  },
  {
    maxAge: 60 * 60, // 1 hour
    name: cacheName,
    getKey: getSongListCacheKey,
  }
)
