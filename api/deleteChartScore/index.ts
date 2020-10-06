import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import type { ScoreSchema } from '../db/scores'
import { ErrorResult, NoContentResult } from '../function'

type DeleteResult = {
  httpResponse: ErrorResult<401 | 404> | NoContentResult
  documents?: ScoreSchema[]
}

/** Get course and orders information that match the specified ID. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers'>,
  scores: ScoreSchema[]
): Promise<DeleteResult> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { httpResponse: new ErrorResult(401) }

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    const message = `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`
    return { httpResponse: new ErrorResult(404, message) }
  }

  const userScores = scores.filter(s => s.userId === user.id)

  if (userScores.length === 0) {
    return { httpResponse: new ErrorResult(404) }
  }

  return {
    httpResponse: { status: 204 },
    documents: userScores.map(s => ({ ...s, ttl: 3600 })),
  }
}
