import type { H3Event } from 'h3'

import type { ClientPrincipal } from '~~/server/utils/auth'

export function createEvent(params?: Record<string, string>): H3Event {
  return {
    node: { req: {} },
    context: { params },
    res: { statusCode: 200 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

export function createClientPrincipal(
  id: string,
  loginId: string,
  isAdmin = false
): ClientPrincipal {
  return {
    identityProvider: 'github',
    userId: loginId,
    userDetails: id,
    userRoles: [
      'anonymous',
      'authenticated',
      ...(isAdmin ? (['administrator'] as const) : []),
    ],
  }
}
