import { and, eq } from 'drizzle-orm'

export const ignoreTimestampCols = {
  createdAt: false,
  updatedAt: false,
  deletedAt: false,
} as const

/**
 * Get login user by provider and providerId
 * @param provider OAuth provider name
 * @param providerId User ID on the OAuth provider
 * @returns User record or undefined if not found
 */
export function getCurrentUser(provider: string, providerId: string) {
  return db.query.users.findFirst({
    where: and(
      eq(schema.users.provider, provider),
      eq(schema.users.providerId, providerId)
    ),
  })
}
