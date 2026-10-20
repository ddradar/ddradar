import { kv } from '@nuxthub/kv'
import { createError, defineEventHandler, readValidatedBody } from 'nuxt/server'
import * as z from 'zod/mini'

import { getTokenConfig } from '#server/utils/auth'
import { getValidatedParams } from '#server/utils/router'
import { apiTokenSchema } from '#shared/schemas/user'

/** Schema for route params */
const paramsSchema = z.compile(z.pick(apiTokenSchema, { id: true }))
/** Schema for request body */
const bodySchema = z.compile(z.pick(apiTokenSchema, { expiresAt: true }))

/**
 * Extend the expiration date of a specific API token.
 */
export default defineEventHandler(async event => {
  const { maxExpirationDays } = getTokenConfig()

  // Validate route params and body
  const { id: tokenId } = getValidatedParams(paramsSchema, event)
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

  // Get token data
  const tokenKey = `user:${user.id}:token:${tokenId}`
  const tokenData = await kv.get<StoredApiToken>(tokenKey)

  if (!tokenData) {
    throw createError({ status: 404, statusText: 'Token not found' })
  }

  // Update expiration date
  const updatedTokenData = { ...tokenData, expiresAt: body.expiresAt }
  await kv.set(tokenKey, updatedTokenData)

  // Return updated token info (without hashedToken)
  return {
    id: tokenId,
    name: updatedTokenData.name,
    createdAt: updatedTokenData.createdAt,
    expiresAt: updatedTokenData.expiresAt,
  } satisfies ApiToken
})
