import { eq } from 'drizzle-orm'
import * as z from 'zod/mini'

import { ignoreTimestampCols } from '~~/server/db/utils'

export default eventHandler(async event => {
  const { id } = await getValidatedRouterParams(
    event,
    z.pick(songSchema, { id: true }).parse
  )

  const song = await db.query.songs.findFirst({
    columns: { ...ignoreTimestampCols },
    with: {
      charts: { columns: { id: false, ...ignoreTimestampCols } },
    },
    where: eq(schema.songs.id, id),
  })

  if (!song) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  return song as Song & { charts: StepChart[] }
})
