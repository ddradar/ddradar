import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { fetchDeleteTargetScores, ScoreSchema } from '../db/scores'
import type { Difficulty } from '../db/songs'
import {
  getBindingNumber,
  NoContentResult,
  NotFoundResult,
  UnauthenticatedResult,
} from '../function'

type DeleteResult = {
  httpResponse: NotFoundResult | UnauthenticatedResult | NoContentResult
  documents?: ScoreSchema[]
}

/** Get course and orders information that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>
): Promise<DeleteResult> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { httpResponse: { status: 401 } }

  const songId: string = bindingData.songId
  const playStyle: 1 | 2 = bindingData.playStyle
  const difficulty = getBindingNumber(bindingData, 'difficulty') as Difficulty

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    return {
      httpResponse: {
        status: 404,
        body: `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`,
      },
    }
  }

  const scores = await fetchDeleteTargetScores(
    user.id,
    songId,
    playStyle,
    difficulty
  )

  if (scores.length === 0) {
    return { httpResponse: { status: 404 } }
  }
  return {
    httpResponse: { status: 204 },
    documents: scores.map(s => ({ ...s, ttl: 3600 })),
  }
}
