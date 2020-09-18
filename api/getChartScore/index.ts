import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { fetchChartScores, fetchScore, ScoreSchema } from '../db/scores'
import type { Difficulty } from '../db/songs'
import { getBindingNumber, NotFoundResult, SuccessResult } from '../function'

/** Get scores that match the specified chart. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers' | 'query'>
): Promise<
  NotFoundResult | SuccessResult<Omit<ScoreSchema, 'id' | 'isPublic'>[]>
> {
  const songId: string = bindingData.songId
  const playStyle = bindingData.playStyle as 1 | 2
  const difficulty = getBindingNumber(bindingData, 'difficulty') as Difficulty
  const scope = ['private', 'medium', 'full'].includes(req.query.scope)
    ? (req.query.scope as 'private' | 'medium' | 'full')
    : 'medium'

  const clientPrincipal = getClientPrincipal(req)
  const user = await getLoginUserInfo(clientPrincipal)

  if (scope === 'private') {
    if (!user) return { status: 404 }
    const score = await fetchScore(user.id, songId, playStyle, difficulty)
    if (!score) {
      return {
        status: 404,
        body: `Not found scores that { songId: "${songId}", playStyle: ${playStyle}, difficulty: ${difficulty} } `,
      }
    }
    return {
      status: 200,
      headers: { 'Content-type': 'application/json' },
      body: [score],
    }
  }

  const body = await fetchChartScores(
    songId,
    playStyle,
    difficulty,
    scope,
    user
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
