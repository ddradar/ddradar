import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import type { GrooveRadarSchema } from '../core/db/userDetails'
import type { UserSchema } from '../core/db/users'
import { ErrorResult, SuccessResult } from '../function'

type GrooveRadarInfo = Omit<GrooveRadarSchema, 'userId' | 'type'>

/** Get Groove Radar that match the specified user ID and play style. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>,
  [user]: Pick<UserSchema, 'id' | 'isPublic'>[],
  radars: GrooveRadarInfo[]
): Promise<ErrorResult<404> | SuccessResult<GrooveRadarInfo[]>> {
  const loginUser = await getLoginUserInfo(getClientPrincipal(req))

  // User is not found or private
  if (!user || (!user.isPublic && user.id !== loginUser?.id)) {
    return new ErrorResult(404)
  }

  const playStyle = bindingData.playStyle as 1 | 2 | undefined
  return new SuccessResult(
    radars
      .filter(r => !playStyle || r.playStyle === playStyle)
      .sort((l, r) => l.playStyle - r.playStyle) // ORDER BY Single, Double
  )
}
