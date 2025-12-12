import { eq } from 'drizzle-orm'
import * as z from 'zod/mini'

const _songApiSchema = z.extend(songSchema, {
  charts: z.array(stepChartSchema),
})

export default eventHandler(async event => {
  const { id } = await getValidatedRouterParams(
    event,
    z.pick(songSchema, { id: true }).parse
  )
  const song = await db.query.songs.findFirst({
    columns: { nameIndex: false, createdAt: false, updatedAt: false },
    with: {
      charts: { columns: { id: false, createdAt: false, updatedAt: false } },
    },
    where: eq(schema.songs.id, id),
  })
  return song as unknown as Song & { charts: StepChart[] }
})
