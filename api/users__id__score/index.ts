import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import type { ScoreStatus } from '../core/api/user'
import { danceLevelSet } from '../core/db/scores'
import type { UserSchema } from '../core/db/users'
import { ErrorResult, SuccessResult } from '../function'

type TotalCount = Omit<ScoreStatus, 'rank'>

/** Get Score statuses that match the specified user ID, play style and level. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>,
  [user]: Pick<UserSchema, 'id' | 'isPublic'>[],
  scoreStatuses: ScoreStatus[],
  totalCounts: TotalCount[]
): Promise<ErrorResult<404> | SuccessResult<ScoreStatus[]>> {
  const loginUser = await getLoginUserInfo(getClientPrincipal(req))

  // User is not found or private
  if (!user || (!user.isPublic && user.id !== loginUser?.id)) {
    return new ErrorResult(404)
  }

  const playStyle = parseInt(req.query.playStyle, 10)
  const isValidPlayStyle = playStyle === 1 || playStyle === 2
  const level = parseInt(req.query.level, 10)
  const isValidLevel = Number.isInteger(level) && level >= 1 && level <= 19

  const noPlays = totalCounts.map(d => ({
    ...d,
    rank: '-' as const,
    count:
      d.count -
      scoreStatuses
        .filter(s => s.playStyle === d.playStyle && s.level === d.level)
        .reduce((prev, curr) => prev + curr.count, 0),
  }))

  const danceLevels = [...danceLevelSet]
  return new SuccessResult(
    [...scoreStatuses, ...noPlays]
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
          : danceLevels.findIndex(s => l.rank === s) -
            danceLevels.findIndex(s => r.rank === s)
      ) // ORDER BY playStyle, level, rank
  )
}
