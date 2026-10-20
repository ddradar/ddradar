import { kv } from '@nuxthub/kv'
import { defineEventHandler } from 'nuxt/server'

/**
 * Get a list of all API tokens for the authenticated user.
 */
export default defineEventHandler(async event => {
  // Require user session with registered user ID (not allow token-authenticated)
  const user = await requireAuthenticatedUserFromSession(event)

  // Prefix-scan token keys for the user
  const tokenKeys = await kv.keys(`user:${user.id}:token`)

  // Fetch all token details
  const tokens = await Promise.all(
    tokenKeys.map(async (key: string) => {
      const tokenData = await kv.get<StoredApiToken>(key)

      if (!tokenData) return null

      const tokenId = key.split(':').pop()
      if (!tokenId) return null

      // Return without hashedToken
      return {
        id: tokenId,
        name: tokenData.name,
        createdAt: tokenData.createdAt,
        expiresAt: tokenData.expiresAt,
      } satisfies ApiToken
    })
  )
  return tokens.filter(Boolean) as ApiToken[]
})
