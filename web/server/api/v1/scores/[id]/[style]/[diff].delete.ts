import { scoreSchema } from '@ddradar/core'
import { fetchList, getContainer } from '@ddradar/db'
import { z } from 'zod'

import { getLoginUserInfo } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'

/** Expected params */
const schema = z.object({
  id: scoreSchema.shape.songId,
  style: z.coerce.number().pipe(scoreSchema.shape.playStyle),
  diff: z.coerce.number().pipe(scoreSchema.shape.difficulty),
})

/**
 * Delete scores that match the specified chart.
 * @description
 * *Note: World record and area top score will not be deleted.*
 * - Need Authentication.
 * - DELETE `api/v1/scores/:id/:style/:diff`
 *   - `id`: {@link ScoreSchema.songId}
 *   - `style`: {@link ScoreSchema.playStyle}
 *   - `diff`: {@link ScoreSchema.difficulty}
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `404 Not Found` if parameters are invalid or no score.
 * - Returns `204 No Content` otherwize.
 */
export default defineEventHandler(async event => {
  const { id, style, diff } = await getValidatedRouterParams(
    event,
    schema.parse
  )

  const user = await getLoginUserInfo(event)
  if (!user) {
    sendNullWithError(event, 401)
    return
  }

  const scores = await fetchList(
    'Scores',
    ['id', 'userId'],
    [
      { condition: 'c.songId = @', value: id },
      { condition: 'c.playStyle = @', value: style },
      { condition: 'c.difficulty = @', value: diff },
      { condition: 'c.userId = @', value: user.id },
    ]
  )

  if (scores.length === 0) {
    sendNullWithError(event, 404)
    return
  }

  await getContainer('Scores').items.batch(
    scores.map(d => ({
      operationType: 'Patch',
      id: d.id,
      partitionKey: d.userId,
      resourceBody: { operations: [{ op: 'add', path: '/ttl', value: 3600 }] },
    }))
  )
})
