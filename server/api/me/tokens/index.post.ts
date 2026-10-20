import { kv } from '@nuxthub/kv'
import { nanoid } from 'nanoid'
import { createError, defineEventHandler, readValidatedBody } from 'nuxt/server'
import * as z from 'zod/mini'

import { getTokenConfig } from '#server/utils/auth'
import { apiTokenSchema } from '#shared/schemas/user'

/** Generate a secure random token */
function generateToken(): string {
  // Generate 32-byte random token (base64url encoded)
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Buffer.from(bytes).toString('base64url')
}

/** Hash token using SHA-256 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const bodySchema = z.compile(
  z.pick(apiTokenSchema, { name: true, expiresAt: true })
)

/**
 * Create a new API token for the authenticated user.
 * The token can be used for Bearer authentication in API requests.
 * Maximum 10 tokens per user.
 */
export default defineEventHandler(async event => {
  const { maxExpirationDays, maxCreationPerUser } = getTokenConfig()

  // Validate request body
  const body = await readValidatedBody(event, i => bodySchema.parse(i))

  // Require user session with registered user ID (not allow token-authenticated)
  const user = await requireAuthenticatedUserFromSession(event)

  const now = Date.now()
  const expiresAtMs = new Date(body.expiresAt).getTime()
  if (Number.isNaN(expiresAtMs)) {
    throw createError({ status: 400, statusText: 'Invalid expiration date' })
  }
  if (expiresAtMs <= now) {
    throw createError({
      status: 400,
      statusText: 'Expiration must be in the future',
    })
  }
  if (expiresAtMs - now > maxExpirationDays * 24 * 60 * 60 * 1000) {
    throw createError({
      status: 400,
      statusText: 'Expiration too far in the future',
    })
  }

  // Check existing token count (prefix-scan by user)
  const tokenKeys = await kv.keys(`user:${user.id}:token`)
  if (tokenKeys.length >= maxCreationPerUser) {
    throw createError({
      status: 400,
      statusText: `Maximum ${maxCreationPerUser} tokens allowed per user`,
    })
  }

  // Generate token with hash-collision avoidance (extremely unlikely)
  let token: string | undefined
  let hashedToken: string | undefined
  let tokenId: string | undefined
  for (let i = 0; i < 5; i++) {
    const candidate = generateToken()
    const candidateHash = await hashToken(candidate)
    const reverseKey = `token:${candidateHash}`
    const existing = await kv.has(reverseKey)
    if (!existing) {
      token = candidate
      hashedToken = candidateHash
      tokenId = nanoid()
      // Store reverse mapping (token hash -> user/token info)
      await kv.set(reverseKey, { userId: user.id, tokenId })
      break
    }
  }

  if (!token || !hashedToken || !tokenId) {
    throw createError({
      status: 500,
      statusText: 'Failed to generate unique token',
    })
  }

  // Store token data
  await kv.set<StoredApiToken>(`user:${user.id}:token:${tokenId}`, {
    name: body.name,
    hashedToken,
    expiresAt: body.expiresAt,
    createdAt: new Date().toISOString(),
  })

  // Return plain token (only this time)
  return { token }
})
