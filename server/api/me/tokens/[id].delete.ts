import { kv } from '@nuxthub/kv'
import { createError, defineEventHandler, setResponseStatus } from 'nuxt/server'
import * as z from 'zod/mini'

import { getValidatedParams } from '#server/utils/router'
import { apiTokenSchema } from '#shared/schemas/user'

/** Schema for route params */
const paramsSchema = z.compile(z.pick(apiTokenSchema, { id: true }))

/**
 * Delete a specific API token by its ID.
 */
export default defineEventHandler(async event => {
  const { id: tokenId } = getValidatedParams(paramsSchema, event)

  // Require user session with registered user ID (not allow token-authenticated)
  const user = await requireAuthenticatedUserFromSession(event)

  // Get token data
  const tokenKey = `user:${user.id}:token:${tokenId}`
  const tokenData = await kv.get<StoredApiToken>(tokenKey)

  if (!tokenData)
    throw createError({ status: 404, statusText: 'Token not found' })

  // Delete reverse mapping & token data
  await Promise.all([
    kv.del(`token:${tokenData.hashedToken}`),
    kv.del(tokenKey),
  ])

  // Return 204 No Content
  setResponseStatus(event, 204)
  return null
})
