import type { H3Event } from 'h3'
import { stringifyQuery } from 'ufo'

import type { ClientPrincipal } from '~~/server/utils/auth'

export function createEvent(
  params?: Record<string, string>,
  query?: Record<string, string | undefined>,
  body?: unknown
): H3Event {
  return {
    method: 'POST',
    node: {
      req: {
        body: JSON.stringify(body),
        headers: {},
      },
    },
    context: { params },
    res: { statusCode: 200 },
    path: `/api${query ? `?${stringifyQuery(query)}` : ''}`,
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
