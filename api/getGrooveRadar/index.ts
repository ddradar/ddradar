import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import type { StepChartSchema } from '../db/songs'
import type { UserSchema } from '../db/users'
import type { NotFoundResult, SuccessResult } from '../function'

type GrooveRadarInfo = Pick<
  StepChartSchema,
  'playStyle' | 'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
>

/** Get Groove Radar that match the specified user ID and play style. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>,
  users: Pick<UserSchema, 'id' | 'isPublic'>[],
  radars: GrooveRadarInfo[]
): Promise<NotFoundResult | SuccessResult<GrooveRadarInfo[]>> {
  const user = await getLoginUserInfo(getClientPrincipal(req))

  // User is not found or private
  if (users.length != 1 || (!users[0].isPublic && users[0].id !== user?.id)) {
    return { status: 404 }
  }

  const playStyle = bindingData.playStyle as 1 | 2 | undefined
  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: radars
      .filter(r => !playStyle || r.playStyle === playStyle)
      .sort((l, r) => l.playStyle - r.playStyle), // Single, Double
  }
}
