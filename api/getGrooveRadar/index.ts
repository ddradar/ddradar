import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import type { StepChartSchema } from '../db/songs'
import type { UserSchema } from '../db/users'
import type { NotFoundResult, SuccessResult } from '../function'

type GrooveRadar = Pick<
  StepChartSchema,
  'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
>

/** Get Groove Radar that match the specified user ID and play style. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>,
  users: Pick<UserSchema, 'id' | 'isPublic'>[],
  radars: (GrooveRadar & Pick<StepChartSchema, 'playStyle'>)[]
): Promise<NotFoundResult | SuccessResult<GrooveRadar[]>> {
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
      .filter(r => playStyle === undefined || r.playStyle === playStyle)
      .sort((l, r) => l.playStyle - r.playStyle) // Single, Double
      .map(r => ({
        stream: r.stream,
        voltage: r.voltage,
        air: r.air,
        freeze: r.freeze,
        chaos: r.chaos,
      })), // Remove playStyle
  }
}
