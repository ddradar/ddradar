import type { HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'
import { Score } from '@ddradar/core'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

type UserVisibility = Pick<Database.UserSchema, 'id' | 'isPublic'>
type ScoreStatus = Api.ScoreStatus
type TotalCount = Omit<Api.ScoreStatus, 'rank'>

/**
 * Get Score statuses that match the specified {@link UserVisibility.id userId}, {@link ScoreStatus.playStyle playStyle} and {@link ScoreStatus.level level}.
 * @description
 * - `GET api/v1/users/:id/score?playStyle=:playStyle&level=:level`
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @param user User Visibility (from Cosmos DB binding)
 * @param scoreStatuses User Score Statuses (from Cosmos DB binding)
 * @param totalCounts Chart total counts (from Cosmos DB binding)
 * @returns
 * - Returns `404 Not Found` if no user that matches `id` or user is private.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * [
 *   { "playStyle": 1, "level": 1, "rank": "-", "count": 20 },
 *   { "playStyle": 1, "level": 1, "rank": "AA+", "count": 10 },
 *   { "playStyle": 1, "level": 1, "rank": "AAA", "count": 20 }
 * ]
 * ```
 */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>,
  [user]: UserVisibility[],
  scoreStatuses: ScoreStatus[],
  totalCounts: TotalCount[]
): Promise<ErrorResult<404> | SuccessResult<ScoreStatus[]>> {
  const loginUser = await getLoginUserInfo(getClientPrincipal(req))

  // User is not found or private
  if (!user || (!user.isPublic && user.id !== loginUser?.id)) {
    return new ErrorResult(404)
  }

  const playStyle = parseInt(req.query.playStyle ?? '', 10)
  const isValidPlayStyle = playStyle === 1 || playStyle === 2
  const level = parseInt(req.query.level ?? '', 10)
  const isValidLevel = Number.isInteger(level) && level >= 1 && level <= 19

  const danceLevels = [...Score.danceLevelSet]
  return new SuccessResult(
    totalCounts
      .filter(
        r =>
          (!isValidPlayStyle || playStyle === r.playStyle) &&
          (!isValidLevel || level === r.level)
      )
      .flatMap(d => {
        const filtered = scoreStatuses.filter(
          r => r.playStyle === d.playStyle && r.level === d.level
        )
        const playedCount = filtered.reduce(
          (prev, curr) => prev + curr.count,
          0
        )
        return [
          ...filtered,
          { ...d, rank: '-' as const, count: d.count - playedCount },
        ]
      })
      .sort((l, r) =>
        l.playStyle !== r.playStyle
          ? l.playStyle - r.playStyle
          : l.level !== r.level
          ? l.level - r.level
          : danceLevels.findIndex(s => l.rank === s) -
            danceLevels.findIndex(s => r.rank === s)
      ) // ORDER BY playStyle, level, rank ASC
  )
}
