import { routerParamsSchema as schema } from '~~/schemas/scores'

/**
 * Delete scores that match the specified chart.
 * @description
 * *Note: World record and area top score will not be deleted.*
 * - Need Authentication.
 * - DELETE `/api/v2/scores/[id]/[style]/[diff]`
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

  await getScoreRepository(event).delete(user.id, id, style, diff)
})
