import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'

import type { UserVisibility } from '../auth'
import { canReadUserData } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

type ClearStatus = Api.ClearStatus
type TotalCount = Omit<ClearStatus, 'clearLamp'>

/**
 * Get Clear status that match the specified {@link UserVisibility.id userId}, {@link ClearStatus.playStyle playStyle} and {@link ClearStatus.level level}.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - `GET api/v1/users/:id/clear?style=:style&lv=:lv`
 *   - `id`: {@link UserVisibility.id}
 *   - `style`(optional): {@link ClearStatus.playStyle}
 *   - `lv`(optional): {@link ClearStatus.level}
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @param user User Visibility (from Cosmos DB binding)
 * @param clearStatuses User Clear Statuses (from Cosmos DB binding)
 * @param totalCounts Chart total counts (from Cosmos DB binding)
 * @returns
 * - Returns `404 Not Found` if no user that matches `id` or user is private.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * [
 *   { "playStyle": 1, "level": 1, "clearLamp": -1, "count": 10 },
 *   { "playStyle": 1, "level": 1, "clearLamp": 6, "count": 10 },
 *   { "playStyle": 1, "level": 1, "clearLamp": 7, "count": 20 }
 * ]
 * ```
 */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>,
  [user]: UserVisibility[],
  clearStatuses: ClearStatus[],
  totalCounts: TotalCount[]
): Promise<ErrorResult<404> | SuccessResult<ClearStatus[]>> {
  if (!canReadUserData(req, user)) return new ErrorResult(404)

  const playStyle = parseInt(req.query.style ?? '', 10)
  const isValidPlayStyle = playStyle === 1 || playStyle === 2
  const level = parseInt(req.query.lv ?? '', 10)
  const isValidLevel = Number.isInteger(level) && level >= 1 && level <= 20

  return new SuccessResult(
    totalCounts
      .filter(
        r =>
          (!isValidPlayStyle || playStyle === r.playStyle) &&
          (!isValidLevel || level === r.level)
      )
      .flatMap(d => {
        const filtered = clearStatuses.filter(
          r => r.playStyle === d.playStyle && r.level === d.level
        )
        const playedCount = filtered.reduce((p, c) => p + c.count, 0)
        return [
          ...filtered,
          { ...d, clearLamp: -1 as const, count: d.count - playedCount },
        ]
      })
      .sort((l, r) =>
        l.playStyle !== r.playStyle
          ? l.playStyle - r.playStyle
          : l.level !== r.level
          ? l.level - r.level
          : l.clearLamp - r.clearLamp
      ) // ORDER BY playStyle, level, clearLamp ASC
  )
}
