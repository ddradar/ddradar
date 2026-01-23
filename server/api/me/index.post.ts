import { and, eq } from 'drizzle-orm'
import { users } from 'hub:db:schema'

import { userSchema } from '#shared/schemas/user'

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event)
  const body = await readValidatedBody(event, userSchema.parse)

  const result: UserInfo[] = await db
    .insert(users)
    .values({
      ...body,
      id: user.id ?? body.id, // Use existing ID if available
      provider: user.provider,
      providerId: user.providerId,
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
      },
    })
    .returning({
      id: users.id,
      name: users.name,
      isPublic: users.isPublic,
      area: users.area,
      ddrCode: users.ddrCode,
    })
  if (result.length !== 1) {
    const message = 'Failed to upsert. Did you register from another device?'
    throw createError({ status: 409, statusText: 'Conflict', message })
  }

  await clearUserCache(user.id ?? body.id)

  // Update session with new user ID and display name
  await setUserSession(event, {
    user: { ...user, id: user.id ?? body.id, displayName: body.name },
    lastAccessedAt: new Date(),
  })

  return result[0]
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        securitySchemes: {
          SessionCookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'auth.session-token',
            description:
              'Session cookie issued by nuxt-auth-utils (auth.session-token)',
          },
        },
        schemas: {
          ErrorResponse: {
            description: 'Error response',
            type: 'object',
            properties: {
              error: { type: 'boolean', description: 'Error or not' },
              url: {
                type: 'string',
                format: 'uri',
                description: 'Request URL',
              },
              data: {
                type: ['object', 'array', 'number', 'string', 'null'],
                description: 'Extra response data',
              },
              statusCode: { type: 'integer', description: 'HTTP status code' },
              statusMessage: { type: 'string', description: 'Status message' },
              message: { type: 'string', description: 'Error message' },
              stack: { type: 'string', description: 'Stack trace' },
            },
          },
        },
        responses: {
          Error: {
            description: 'Generic error response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          Unauthorized: {
            $ref: '#/components/responses/Error',
            description: 'Unauthorized - User is not authenticated',
          },
          RegistrationRequired: {
            $ref: '#/components/responses/Error',
            description: 'Forbidden - User registration required',
          },
        },
      },
    },
    summary: 'Create or Update Current User Profile',
    tags: ['User'],
    description:
      'Create or update the profile of the currently logged-in user. ' +
      'If the user does not exist, a new user record will be created.',
    security: [{ SessionCookieAuth: [] }],
    requestBody: {
      description: 'User profile data to create or update',
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/User' },
        },
      },
    },
    responses: {
      200: {
        description:
          'The created or updated user profile (same as request body)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/User' },
          },
        },
      },
      401: { $ref: '#/components/responses/Unauthorized' },
      409: {
        $ref: '#/components/responses/Error',
        description: 'Conflict - Duplicate user registration detected',
      },
    },
  },
})
