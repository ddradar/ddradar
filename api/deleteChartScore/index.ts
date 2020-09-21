import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { deleteChartScore } from '../db/scores'
import type { Difficulty } from '../db/songs'
import {
  getBindingNumber,
  NoContentResult,
  NotFoundResult,
  UnauthenticatedResult,
} from '../function'

/** Get course and orders information that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>
): Promise<NotFoundResult | UnauthenticatedResult | NoContentResult> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { status: 401 }

  const songId: string = bindingData.songId
  const playStyle: 1 | 2 = bindingData.playStyle
  const difficulty = getBindingNumber(bindingData, 'difficulty') as Difficulty

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    return {
      status: 404,
      body: `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`,
    }
  }

  return (await deleteChartScore(user.id, songId, playStyle, difficulty))
    ? { status: 204 }
    : { status: 404 }
}
