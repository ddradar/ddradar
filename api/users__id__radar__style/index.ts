import type { Context, HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'

import type { UserVisibility } from '../auth'
import { canReadUserData } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

type GrooveRadarInfo = Api.GrooveRadarInfo

/**
 * Get Groove Radar that match the specified {@link UserVisibility.id userId} and {@link GrooveRadarInfo.playStyle playStyle}.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - `GET api/v1/users/:id/radar/:style?`
 *   - `id`: {@link UserVisibility.id}
 *   - `style`(optional): {@link GrooveRadarInfo.playStyle}
 * @param bindingData.style {@link GrooveRadarInfo.playStyle PlayStyle} (optional)
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
  if (!canReadUserData(req, user)) return new ErrorResult(404)

  const playStyle = bindingData.style
  return new SuccessResult(
    radars
      .filter(r => !playStyle || r.playStyle === playStyle)
      .sort((l, r) => l.playStyle - r.playStyle) // ORDER BY Single, Double
  )
}
