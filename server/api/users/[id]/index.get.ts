import { and, eq, or } from 'drizzle-orm'
import * as z from 'zod/mini'

import { type User, userSchema } from '~~/shared/types/user'

/** Schema for router params */
const _paramsSchema = z.pick(userSchema, { id: true })

// Never use `cachedEventHandler` because user privacy settings may change
export default defineEventHandler(async event => {
  const { id } = await getValidatedRouterParams(event, _paramsSchema.parse)
  const user = await getAuthenticatedUser(event)

  const conditions = [
    and(eq(schema.users.id, id), eq(schema.users.isPublic, true)),
  ]
  if (user) {
    // Logged-in user can access their own data regardless of `isPublic`
    conditions.push(
      and(
        eq(schema.users.id, id),
        eq(schema.users.provider, user.provider),
        eq(schema.users.providerId, user.providerId)
      )
    )
  }

  const result: User | undefined = await db.query.users.findFirst({
    columns: {
      id: true,
      name: true,
      isPublic: true,
      area: true,
      ddrCode: true,
    },
    where: or(...conditions),
  })
  if (!result)
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  return result
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          User: {
            description: 'User details',
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'User ID',
                // @ts-expect-error - not provided in nitro types
                pattern: '^[a-zA-Z0-9_-]{3,32}$',
              },
              name: {
                type: 'string',
                description: 'User name',
              },
              isPublic: {
                type: 'boolean',
                description:
                  'Whether the user profile and scores are public or private',
              },
              area: {
                type: 'integer',
                description: 'Area code',
                minimum: 0,
                maximum: 118,
              },
              ddrCode: {
                type: ['integer', 'null'],
                description: 'DDR code (8-digit number)',
                minimum: 10000000,
                maximum: 99999999,
              },
            },
            required: ['id', 'name', 'isPublic', 'area'],
          },
        },
      },
    },
    summary: 'Get User Details by ID',
    tags: ['User'],
    description:
      'Retrieve detailed information about a user by their ID. ' +
      'If the user profile is not public, only the user themselves can access their data.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        // @ts-expect-error - not provided in nitro types
        schema: { $ref: '#/components/schemas/User/properties/id' },
        required: true,
        description: 'User ID',
      },
    ],
    responses: {
      200: {
        description: 'User details',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/User' } },
        },
      },
      404: {
        description: 'User not found or not accessible',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  },
})
