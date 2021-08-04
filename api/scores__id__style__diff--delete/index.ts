import type { HttpRequest } from '@azure/functions'
import type { Database } from '@ddradar/core'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, NoContentResult } from '../function'

type ScoreSchema = Database.ScoreSchema

type DeleteResult = {
  /** HTTP output binding */
  httpResponse: ErrorResult<404> | NoContentResult
  /** Cosmos DB output binding */
  documents?: ScoreSchema[]
}

/**
 * Delete scores that match the specified chart.
 * @description
 * *Note: World record and area top score will not be deleted.*
 * - Need Authentication.
 * - `DELETE api/v1/scores/:id/:style/:diff`
 *   - `id`: {@link ScoreSchema.songId}
 *   - `style`: {@link ScoreSchema.playStyle}
 *   - `diff`: {@link ScoreSchema.difficulty}
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @param scores
 * Score data that matches {@link ScoreSchema.songId songId}, {@link ScoreSchema.playStyle playStyle} and {@link ScoreSchema.difficulty difficulty}. (from Cosmos DB input binding)
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `404 Not Found` if user registration is not completed.
 * - Returns `404 Not Found` if parameters are invalid or no score.
 * - Returns `204 No Content` otherwize.
 */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers'>,
  scores: ScoreSchema[]
): Promise<DeleteResult> {
  const user = await getLoginUserInfo(getClientPrincipal(req))
  if (!user) {
    return {
      httpResponse: new ErrorResult(404, 'User registration is not completed'),
    }
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
