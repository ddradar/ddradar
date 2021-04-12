import type { Context, HttpRequest } from '@azure/functions'
import type { Database } from '@ddradar/core'
import type { GrooveRadarInfo } from '@ddradar/core/api/user'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

/** Get Groove Radar that match the specified user ID and play style. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>,
  [user]: Pick<Database.UserSchema, 'id' | 'isPublic'>[],
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
