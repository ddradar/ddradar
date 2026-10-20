import { db } from '@nuxthub/db'
import { users } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, defineEventHandler, readValidatedBody } from 'nuxt/server'

import { userSchema } from '#shared/schemas/user'

/**
 * Create or update the profile of the currently logged-in user.
 * If the user does not exist, a new user record will be created.
 */
export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event)
  const body = await readValidatedBody(event, i => userSchema.parse(i))

  const id = user.id ?? body.id // Use existing ID if available
  const [result]: UserInfo[] = await db
    .insert(users)
    .values({
      ...body,
      id,
      provider: user.provider,
      providerId: user.providerId,
      createdBy: id,
      updatedBy: id,
    })
    .onConflictDoUpdate({
      target: [users.id],
      targetWhere: and(
        eq(users.provider, user.provider),
        eq(users.providerId, user.providerId)
      ),
      set: {
        name: body.name,
        isPublic: body.isPublic,
        area: body.area,
        ddrCode: body.ddrCode,
        updatedBy: id,
      },
    })
    .returning({
      id: users.id,
      name: users.name,
      isPublic: users.isPublic,
      area: users.area,
      ddrCode: users.ddrCode,
    })
  if (!result) {
    const message = 'Failed to upsert. Did you register from another device?'
    throw createError({ status: 409, statusText: 'Conflict', message })
  }

  await clearUserCache(id)

  // Update session with new user ID and display name
  await setUserSession(event, {
    user: { ...user, id, displayName: body.name },
    lastAccessedAt: new Date(),
  })

  return result
})
