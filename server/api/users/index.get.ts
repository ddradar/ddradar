import { db } from '@nuxthub/db'
import { users } from '@nuxthub/db/schema'
import { and, eq, isNull, or, sql } from 'drizzle-orm'
import * as z from 'zod/mini'

/** Schema for query parameters */
const _querySchema = z.object({
  /** User name (partial match) */
  name: z.catch(z.optional(z.coerce.string()), undefined),
  /** Area code */
  area: z.catch(
    z.optional(z.coerce.number().check(z.int(), z.minimum(0), z.maximum(118))),
    undefined
  ),
  /** DDR code (8-digit number) */
  code: z.catch(
    z.optional(
      z.coerce.number().check(z.int(), z.minimum(10000000), z.maximum(99999999))
    ),
    undefined
  ),
})

// Never use `cachedEventHandler` because user privacy settings may change
export default defineEventHandler(async event => {
  const query = await getValidatedQuery(event, _querySchema.parse)
  const user = await getAuthenticatedUser(event)

  const conditions = [
    isNull(users.deletedAt),
    user
      ? or(
          eq(users.isPublic, true),
          // Logged-in user can access their own data regardless of `isPublic`
          eq(users.id, user.id)
        )
      : eq(users.isPublic, true),
  ]
  if (query.name) {
    const esc = '\\'
    const escapedName = query.name
      .replaceAll(esc, `${esc}${esc}`)
      .replaceAll('%', `${esc}%`)
      .replaceAll('_', `${esc}_`)
    conditions.push(sql`${users.name} LIKE ${`%${escapedName}%`} ESCAPE ${esc}`)
  }
  if (query.area !== undefined) conditions.push(eq(users.area, query.area))
  if (query.code !== undefined) conditions.push(eq(users.ddrCode, query.code))

  const result: UserInfo[] = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      isPublic: true,
      area: true,
      ddrCode: true,
    },
    where: and(...conditions),
  })
  return result
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    summary: 'Get User List',
    tags: ['User'],
    description:
      'Retrieve a list of users with optional filtering by name, area, and DDR code. ' +
      'Only public profiles are returned unless the requester is the user themselves.',
    parameters: [
      {
        in: 'query',
        name: 'name',
        schema: { type: 'string' },
        required: false,
        description: 'User name (partial match)',
      },
      {
        in: 'query',
        name: 'area',
        // @ts-expect-error - not provided in nitro types
        schema: { $ref: '#/components/schemas/AreaCode' },
        required: false,
        description: 'Area code',
      },
      {
        in: 'query',
        name: 'code',
        // @ts-expect-error - not provided in nitro types
        schema: { $ref: '#/components/schemas/User/properties/ddrCode' },
        required: false,
        description: 'DDR code (8-digit number)',
      },
    ],
    responses: {
      200: {
        description: 'Array of user',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
    },
  },
})
