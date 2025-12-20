import * as z from 'zod/mini'

import { cacheName as getSongByIdKey } from '~~/server/api/songs/[id].get'
import { cacheName as getSongListKey } from '~~/server/api/songs/index.get'

/** Schema for request body */
const _bodySchema = z.extend(songSchema, {
  charts: z.array(stepChartSchema),
  deletedAt: z.optional(z.date()),
})

export default eventHandler(async event => {
  const user = await getAuthenticatedUser(event)
  if (!user?.roles.includes('admin'))
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const body = await readValidatedBody(event, _bodySchema.parse)
  await Promise.all([
    db
      .insert(schema.songs)
      .values({
        id: body.id,
        name: body.name,
        nameKana: body.nameKana,
        artist: body.artist,
        bpm: body.bpm,
        series: body.series,
        deletedAt: body.deletedAt,
      })
      .onConflictDoUpdate({
        target: schema.songs.id,
        set: {
          name: body.name,
          nameKana: body.nameKana,
          artist: body.artist,
          bpm: body.bpm,
          series: body.series,
          deletedAt: body.deletedAt,
        },
      }),
    ...body.charts.map(chart =>
      db
        .insert(schema.charts)
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
          deletedAt: body.deletedAt,
        })
        .onConflictDoUpdate({
          target: [
            schema.charts.id,
            schema.charts.playStyle,
            schema.charts.difficulty,
          ],
          set: {
            bpm: chart.bpm,
            level: chart.level,
            notes: chart.notes,
            freezes: chart.freezes,
            shocks: chart.shocks,
            radar: chart.radar,
            deletedAt: body.deletedAt,
          },
        })
    ),
  ])

  // Clear cache for Song API
  await useStorage('cache').removeItem(
    `nitro:handler:${getSongByIdKey}:${body.id}.json`
  )
  await useStorage('cache').removeItem(`nitro:handler:${getSongListKey}`)

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
    security: [{ SessionCookieAuth: [], BearerAuth: [] }],
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
                type: ['number', 'null'],
                description:
                  'Deletion UNIX timestamp. Set to null for active songs.',
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
        description: 'Forbidden - User lacks admin role',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  },
})
