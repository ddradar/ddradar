import { Song } from '@ddradar/core'
import { fetchList, getContainer } from '@ddradar/db'
import type { H3Event } from 'h3'

import { getLoginUserInfo } from '~/server/auth'
import { sendNullWithError } from '~/server/utils'

/**
 * Delete scores that match the specified chart.
 * @description
 * *Note: World record and area top score will not be deleted.*
 * - Need Authentication.
 * - DELETE `api/v1/scores/:id/:style/:diff`
 *   - `id`: {@link ScoreSchema.songId}
 *   - `style`: {@link ScoreSchema.playStyle}
 *   - `diff`: {@link ScoreSchema.difficulty}
 * @param event HTTP Event
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `404 Not Found` if parameters are invalid or no score.
 * - Returns `204 No Content` otherwize.
 */
export default async (event: H3Event) => {
  // route params
  const id: string = event.context.params.id
  const style = parseFloat(event.context.params.style)
  const diff = parseFloat(event.context.params.diff)
  if (
    !Song.isValidSongId(id) ||
    !Song.isPlayStyle(style) ||
    !Song.isDifficulty(diff)
  ) {
    sendNullWithError(event, 404)
    return
  }

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
}
