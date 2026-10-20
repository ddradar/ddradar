import { createError, defineEventHandler } from 'nuxt/server'

import { getValidatedParams } from '#server/utils/router'
import { songIdSchema } from '#shared/schemas/song'

/**
 * Get song information by ID
 */
export default defineEventHandler(async event => {
  const { id } = getValidatedParams(songIdSchema, event)

  const song = await getCachedSongInfo(event, id)
  if (!song) throw createError({ status: 404, statusText: 'Not Found' })
  return song
})
