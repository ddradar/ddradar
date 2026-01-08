import { charts, songs } from 'hub:db:schema'
import * as z from 'zod/mini'

import { songSchema } from '#shared/schemas/song'
import { stepChartSchema } from '#shared/schemas/step-chart'

/** Schema for request body */
const _bodySchema = z.extend(songSchema, {
  charts: z.array(stepChartSchema),
  deletedAt: z.optional(z.iso.datetime()),
})

export default defineEventHandler(async event => {
  const user = await requireAuthenticatedUser(event)
  if (!user.roles.includes('admin'))
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const body = await readValidatedBody(event, _bodySchema.parse)

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
          bpm: chart.bpm,
          level: chart.level,
          notes: chart.notes,
          freezes: chart.freezes,
          shocks: chart.shocks,
          radar: chart.radar,
          deletedAt,
        })
        .onConflictDoUpdate({
          target: [charts.id, charts.playStyle, charts.difficulty],
          set: {
            bpm: chart.bpm,
            level: chart.level,
            notes: chart.notes,
            freezes: chart.freezes,
            shocks: chart.shocks,
            radar: chart.radar,
            deletedAt,
          },
        })
    ),
  ])

  await clearSongCache(body.id)

  return body
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    summary: 'Create or update a Song data (Admin only)',
    tags: ['Song'],
    description:
      'Create or update a Song data. ' +
      'If the song does not exist, a new song record will be created.',
    security: [{ SessionCookieAuth: [] }, { BearerAuth: [] }],
    requestBody: {
      description: 'Song data to create or update',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { $ref: '#/components/schemas/Song/properties/id' },
              name: { $ref: '#/components/schemas/Song/properties/name' },
              nameKana: {
                $ref: '#/components/schemas/Song/properties/nameKana',
              },
              artist: { $ref: '#/components/schemas/Song/properties/artist' },
              bpm: { $ref: '#/components/schemas/Song/properties/bpm' },
              series: { $ref: '#/components/schemas/Song/properties/series' },
              charts: { $ref: '#/components/schemas/Song/properties/charts' },
              deletedAt: {
                type: ['string', 'null'],
                format: 'date-time',
                description:
                  'Deletion ISO 8601 timestamp. Set to null for active songs.',
              },
            },
            required: ['id', 'name', 'nameKana', 'artist', 'series', 'charts'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Song created or updated successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { $ref: '#/components/schemas/Song/properties/id' },
                name: { $ref: '#/components/schemas/Song/properties/name' },
                nameKana: {
                  $ref: '#/components/schemas/Song/properties/nameKana',
                },
                artist: { $ref: '#/components/schemas/Song/properties/artist' },
                bpm: { $ref: '#/components/schemas/Song/properties/bpm' },
                series: { $ref: '#/components/schemas/Song/properties/series' },
                charts: { $ref: '#/components/schemas/Song/properties/charts' },
                deletedAt: {
                  type: ['number', 'null'],
                  description:
                    'Deletion UNIX timestamp. Set to null for active songs.',
                },
              },
              required: [
                'id',
                'name',
                'nameKana',
                'artist',
                'series',
                'charts',
              ],
            },
          },
        },
      },
      401: { $ref: '#/components/responses/Unauthorized' },
      403: {
        $ref: '#/components/responses/Error',
        description: 'User lacks admin role',
      },
    },
  },
})
