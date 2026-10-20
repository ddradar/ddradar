import { createError, defineEventHandler } from 'nuxt/server'

import { getValidatedParams } from '#server/utils/router'
import { userIdSchema } from '#shared/schemas/user'

/**
 * Retrieve detailed information about a user by their ID.
 * If the user profile is not public, only the user themselves can access their data.
 */
export default defineEventHandler(async event => {
  const { id } = getValidatedParams(userIdSchema, event)
  const loginUser = await getAuthenticatedUser(event)

  const user = await getCachedUser(event, id)
  // Handle user visibility (user must be public or logged-in as the user)
  if (!user || (!user.isPublic && user.id !== loginUser?.id))
    throw createError({ status: 404, statusText: 'Not Found' })

  return user
})
