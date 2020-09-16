import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { getContainer } from '../cosmos'
import {
  getBindingData,
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
  const playStyle: number = bindingData.playStyle
  const difficulty = getBindingData(bindingData, 'difficulty')

  // In Azure Functions, this function will only be invoked if a valid route.
  // So this check is only used to unit tests.
  if (
    !/^[01689bdiloqDIOPQ]{32}$/.test(songId) ||
    (playStyle !== 1 && playStyle !== 2) ||
    ![0, 1, 2, 3, 4].includes(difficulty)
  ) {
    return { status: 404 }
  }

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    return {
      status: 404,
      body: `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`,
    }
  }

  const container = getContainer('Scores')
  try {
    await container
      .item(`${user.id}-${songId}-${playStyle}-${difficulty}`, user.id)
      .delete()
    return { status: 204 }
  } catch {
    return { status: 404 }
  }
}
