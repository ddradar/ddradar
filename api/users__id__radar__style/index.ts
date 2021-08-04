import type { Context, HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

type UserVisibility = Pick<Database.UserSchema, 'id' | 'isPublic'>
type GrooveRadarInfo = Api.GrooveRadarInfo

/**
 * Get Groove Radar that match the specified {@link UserVisibility.id userId} and {@link GrooveRadarInfo.playStyle playStyle}.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - `GET api/v1/users/:id/radar/:playStyle?`
 *   - `id`: {@link UserVisibility.id}
 *   - `playStyle`(optional): {@link GrooveRadarInfo.playStyle}
 * @param bindingData.playStyle {@link GrooveRadarInfo.playStyle PlayStyle} (optional)
 * @param req HTTP Request (from HTTP trigger)
 * @param user User Visibility (from Cosmos DB binding)
 * @param radars User Groove Radar data (from Cosmos DB binding)
 * @returns
 * - Returns `404 Not Found` if no user that matches `id` or user is private.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * [
 *   {
 *     "playStyle": 1,
 *     "stream": 100,
 *     "voltage": 100,
 *     "air": 100,
 *     "freeze": 100,
 *     "chaos": 100
 *   },
 *   {
 *     "playStyle": 2,
 *     "stream": 100,
 *     "voltage": 100,
 *     "air": 100,
 *     "freeze": 100,
 *     "chaos": 100
 *   }
 * ]
 * ```
 */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>,
  [user]: UserVisibility[],
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
