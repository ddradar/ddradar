import { seriesSet, songSchema } from '@ddradar/core'
import { dbSongSchema } from '@ddradar/db'
import { z } from 'zod'

/** GET `/api/v2/songs/[id]` expected router params */
export const getRouterParamsSchema = songSchema.pick({ id: true })

/** GET `/api/v2/songs` expected query */
export const listQuerySchema = z.object({
  name: z.coerce
    .number()
    .pipe(songSchema.shape.nameIndex)
    .optional()
    .catch(undefined),
  series: z.coerce
    .number()
    .int()
    .min(0)
    .max(seriesSet.size - 1)
    .optional()
    .catch(undefined),
})

/** POST `/api/v2/songs` expected body */
export const postBodySchema = dbSongSchema.omit({ type: true })
