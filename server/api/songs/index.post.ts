import { db } from '@nuxthub/db'
import { charts, songs } from '@nuxthub/db/schema'
import { createError, defineEventHandler, readValidatedBody } from 'nuxt/server'
import * as z from 'zod/mini'

import { songSchema } from '#shared/schemas/song'
import { stepChartSchema } from '#shared/schemas/step-chart'
import type { StepChart } from '#shared/types/song'

/** Schema for request body */
const bodySchema = z.compile(
  z.extend(songSchema, {
    charts: z.array(stepChartSchema),
    deletedAt: z.optional(z.iso.datetime()),
  })
)

/**
 * Create or update a Song data (Admin only)
 */
export default defineEventHandler(async event => {
  const user = await requireAuthenticatedUser(event)
  if (!user.roles.includes('admin'))
    throw createError({ status: 403, statusText: 'Forbidden' })

  const body = await readValidatedBody(event, i => bodySchema.parse(i))

  const deletedAt = body.deletedAt ? new Date(body.deletedAt) : null
  const database = db
  await database.batch([
    database
      .insert(songs)
      .values({
        id: body.id,
        name: body.name,
        nameKana: body.nameKana,
        artist: body.artist,
        bpm: body.bpm,
        series: body.series,
        createdBy: user.id,
        updatedBy: user.id,
        deletedAt,
      })
      .onConflictDoUpdate({
        target: songs.id,
        set: {
          name: body.name,
          nameKana: body.nameKana,
          artist: body.artist,
          bpm: body.bpm,
          series: body.series,
          updatedBy: user.id,
          deletedAt,
        },
      }),
    ...body.charts.map(chart =>
      database
        .insert(charts)
        .values({
          id: body.id,
          playStyle: chart.playStyle,
          difficulty: chart.difficulty,
          bpm: normalizeBpm(chart.bpm),
          level: chart.level,
          notes: chart.notes,
          freezes: chart.freezes,
          shocks: chart.shocks,
          radar: chart.radar,
          createdBy: user.id,
          updatedBy: user.id,
          deletedAt,
        })
        .onConflictDoUpdate({
          target: [charts.id, charts.playStyle, charts.difficulty],
          set: {
            bpm: normalizeBpm(chart.bpm),
            level: chart.level,
            notes: chart.notes,
            freezes: chart.freezes,
            shocks: chart.shocks,
            radar: chart.radar,
            updatedBy: user.id,
            deletedAt,
          },
        })
    ),
  ])

  await clearSongCache(body.id)

  return body

  function normalizeBpm(bpm: StepChart['bpm']): StepChart['bpm'] {
    return bpm[0] === bpm.at(-1) ? [bpm[0]] : bpm
  }
})
