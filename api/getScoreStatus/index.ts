import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { DanceLevelList } from '../db/scores'
import type { ScoreStatusSchema } from '../db/user-details'
import type { UserSchema } from '../db/users'
import { NotFoundResult, SuccessResult } from '../function'

type ScoreStatus = Omit<ScoreStatusSchema, 'userId' | 'type'>

/** Get Score statuses that match the specified user ID, play style and level. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>,
  [user]: Pick<UserSchema, 'id' | 'isPublic'>[],
  scoreStatuses: ScoreStatus[]
): Promise<NotFoundResult | SuccessResult<ScoreStatus[]>> {
  const loginUser = await getLoginUserInfo(getClientPrincipal(req))

  // User is not found or private
  if (!user || (!user.isPublic && user.id !== loginUser?.id)) {
    return { status: 404 }
  }

  const playStyle = parseInt(req.query.playStyle, 10)
  const isValidPlayStyle = playStyle === 1 || playStyle === 2
  const level = parseInt(req.query.level, 10)
  const isValidLevel = Number.isInteger(level) && level >= 1 && level <= 19

  return new SuccessResult(
    scoreStatuses
      .filter(
        r =>
          (!isValidPlayStyle || r.playStyle === playStyle) &&
          (!isValidLevel || r.level === level)
      )
      .sort((l, r) =>
        l.playStyle !== r.playStyle
          ? l.playStyle - r.playStyle
          : l.level !== r.level
          ? l.level - r.level
          : DanceLevelList.findIndex(s => l.rank === s) -
            DanceLevelList.findIndex(s => r.rank === s)
      ) // ORDER BY playStyle, level, rank
  )
}
