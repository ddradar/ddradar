import { db } from '@nuxthub/db'
import { kv } from '@nuxthub/kv'
import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'

import type { User as SessionUser } from '#auth-utils'

export type StoredApiToken = Pick<
  ApiToken,
  'name' | 'expiresAt' | 'createdAt'
> & {
  /** Hashed token for secure storage and lookup */
  hashedToken: string
}
const userRegistrationRequired = 'User registration required'

/**
 * Validate API token and return user ID
 * @param token Bearer token from Authorization header
 * @returns User ID associated with the token
 * @throws 401 if token is invalid or expired
 */
async function validateTokenAndGetUserId(token: string): Promise<string> {
  // Hash the token for lookup
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashedToken = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Lookup reverse mapping
  const reverseKey = `token:${hashedToken}`
  const tokenInfo = await kv.get<{ userId: string; tokenId: string }>(
    reverseKey
  )

  if (!tokenInfo)
    throw createError({ status: 401, statusText: 'Invalid token' })

  // Get token details to check expiration
  const tokenKey = `user:${tokenInfo.userId}:token:${tokenInfo.tokenId}`
  const tokenData = await kv.get<{
    name: string
    hashedToken: string
    expiresAt: string
    createdAt: string
  }>(tokenKey)

  if (!tokenData)
    throw createError({ status: 401, statusText: 'Invalid token' })

  // Check expiration
  const expiresAt = new Date(tokenData.expiresAt)
  if (expiresAt < new Date())
    throw createError({ status: 401, statusText: 'Token expired' })

  return tokenInfo.userId
}

/**
 * Get authenticated user from either session or API token
 * Supports both cookie-based session authentication and Bearer token authentication
 *
 * @param event H3Event
 * @returns User object from database, or null if no valid authentication found
 * @throws 401 if token validation fails without session authentication
 * @throws 403 if session and token user mismatch or user registration incomplete
 */
export async function getAuthenticatedUser(
  event: H3Event
): Promise<Required<Pick<SessionUser, 'id' | 'roles'>> | null> {
  let userIdFromSession: string | undefined
  let userIdFromToken: string | undefined

  // Check session authentication (cookie-based)
  const session = await getUserSession(event)
  if (session?.user) {
    if (!session.user.id) {
      throw createError({ status: 403, statusText: userRegistrationRequired })
    }
    userIdFromSession = session.user.id
  }

  // Check API token authentication (Bearer token)
  const auth = getHeader(event, 'authorization')
  if (auth?.startsWith('Bearer ')) {
    const token = auth.replace('Bearer ', '')
    try {
      userIdFromToken = await validateTokenAndGetUserId(token)
    } catch (error) {
      // If token auth failed and no session, throw the token error
      if (!userIdFromSession) throw error
    }
  }

  // If no valid authentication found, return null
  if (!userIdFromSession && !userIdFromToken) return null

  // If both exist, they must match
  if (
    userIdFromSession &&
    userIdFromToken &&
    userIdFromSession !== userIdFromToken
  ) {
    throw createError({
      status: 403,
      statusText: 'User ID mismatch between session and token',
    })
  }

  // Fetch user from database
  const user = session.user?.id
    ? session.user
    : await db.query.users.findFirst({
        columns: { id: true, roles: true },
        where: eq(schema.users.id, userIdFromToken!),
      })
  return (user as Required<Pick<SessionUser, 'id' | 'roles'>>) || null
}

/**
 * Get authenticated user from either session or API token
 * Supports both cookie-based session authentication and Bearer token authentication
 *
 * @param event H3Event
 * @returns User object from database
 * @throws 401 if token validation fails without session authentication
 * @throws 403 if session and token user mismatch or user registration incomplete
 */
export async function requireAuthenticatedUser(
  event: H3Event
): Promise<Required<Pick<SessionUser, 'id' | 'roles'>>> {
  const user = await getAuthenticatedUser(event)
  if (!user) throw createError({ status: 401, statusText: 'Unauthorized' })
  return user
}

/**
 * Get authenticated user from either session
 *
 * @param event H3Event
 * @returns User object from database, or null if no valid authentication found
 * @throws 401 if no session
 * @throws 403 if user registration is not complete
 */
export async function requireAuthenticatedUserFromSession(
  event: H3Event
): Promise<Required<Pick<SessionUser, 'id' | 'roles'>>> {
  const { user } = await requireUserSession(event)
  if (!user?.id)
    throw createError({ status: 403, statusText: userRegistrationRequired })
  return user as Required<Pick<SessionUser, 'id' | 'roles'>>
}
