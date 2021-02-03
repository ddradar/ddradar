import type { HttpRequest } from '@azure/functions'
import type { ScoreInfo } from '@ddradar/core/api/score'
import type { ScoreSchema } from '@ddradar/core/db/scores'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

/** Get scores that match the specified chart. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>,
  scores: ScoreSchema[]
): Promise<ErrorResult<404> | SuccessResult<ScoreInfo[]>> {
  const scope = ['private', 'medium', 'full'].includes(req.query.scope ?? '')
    ? (req.query.scope as 'private' | 'medium' | 'full')
    : 'medium'

  const user = await getLoginUserInfo(getClientPrincipal(req))

  if (scope === 'private' && !user) return new ErrorResult(404)

  /**
   * private: `[user.id]`
   * medium, full: `[user.id, '0', user.area]`
   */
  const userIds = [
    user?.id,
    ...(scope !== 'private' ? ['0', `${user?.area ?? ''}`] : []),
  ].filter(u => u)

  const body = scores
    .filter(s => userIds.includes(s.userId) || (scope === 'full' && s.isPublic))
    .map<ScoreInfo>(s => ({
      userId: s.userId,
      userName: s.userName,
      songId: s.songId,
      songName: s.songName,
      playStyle: s.playStyle,
      difficulty: s.difficulty,
      level: s.level,
      score: s.score,
      clearLamp: s.clearLamp,
      rank: s.rank,
      ...(s.maxCombo !== undefined ? { maxCombo: s.maxCombo } : {}),
      ...(s.exScore !== undefined ? { exScore: s.exScore } : {}),
    }))

  if (body.length === 0) return new ErrorResult(404)

  return new SuccessResult(body)
}
