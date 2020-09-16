import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { fetchChartScores, ScoreSchema } from '../db/scores'
import { Difficulty } from '../db/songs'
import { getBindingData, NotFoundResult, SuccessResult } from '../function'

type Score = Omit<ScoreSchema, 'id' | 'isPublic'>
type Scope = 'private' | 'medium' | 'full'

/** Get scores that match the specified chart. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers' | 'query'>
): Promise<NotFoundResult | SuccessResult<Score[]>> {
  const songId: string = bindingData.songId
  const playStyle = bindingData.playStyle as 1 | 2
  const difficulty = getBindingData(bindingData, 'difficulty') as Difficulty
  const scope: Scope = ['private', 'medium', 'full'].includes(req.query.scope)
    ? (req.query.scope as Scope)
    : 'medium'

  // Get login user info
  const clientPrincipal = getClientPrincipal(req)
  const user = await getLoginUserInfo(clientPrincipal)

  const body = await fetchChartScores(
    songId,
    playStyle,
    difficulty,
    user,
    scope
  )

  if (body.length === 0) {
    return {
      status: 404,
      body: `Not found scores that { songId: "${songId}", playStyle: ${playStyle}, difficulty: ${difficulty} } `,
    }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body,
  }
}
