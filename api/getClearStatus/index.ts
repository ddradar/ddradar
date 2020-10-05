import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import type { ClearStatusSchema } from '../db/user-details'
import type { UserSchema } from '../db/users'
import type { NotFoundResult, SuccessResult } from '../function'

type ClearStatus = Omit<ClearStatusSchema, 'userId' | 'type'>

/** Get Clear status that match the specified user ID and play style. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>,
  [user]: Pick<UserSchema, 'id' | 'isPublic'>[],
  clearStatuses: ClearStatus[]
): Promise<NotFoundResult | SuccessResult<ClearStatus[]>> {
  const loginUser = await getLoginUserInfo(getClientPrincipal(req))

  // User is not found or private
  if (!user || (!user.isPublic && user.id !== loginUser?.id)) {
    return { status: 404 }
  }

  const playStyle = parseInt(req.query.playStyle, 10)
  const isValidPlayStyle = playStyle === 1 || playStyle === 2
  const level = parseInt(req.query.level, 10)
  const isValidLevel = Number.isInteger(level) && level >= 1 && level <= 20

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: clearStatuses
      .filter(
        r =>
          (!isValidPlayStyle || playStyle === r.playStyle) &&
          (!isValidLevel || level === r.level)
      )
      .sort((l, r) =>
        l.playStyle !== r.playStyle
          ? l.playStyle - r.playStyle
          : l.level !== r.level
          ? l.level - r.level
          : l.clearLamp - r.clearLamp
      ), // ORDER BY Single 1, Single 2, ..., Single 19, Double 1, ...
  }
}
