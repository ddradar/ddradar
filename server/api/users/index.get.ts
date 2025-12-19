import { and, eq, or, sql } from 'drizzle-orm'
import * as z from 'zod/mini'

import type { User } from '~~/shared/types/user'

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
  const session = await getUserSession(event)

  const conditions = [
    session.user
      ? or(
          eq(schema.users.isPublic, true),
          // Logged-in user can access their own data regardless of `isPublic`
          and(
            eq(schema.users.provider, session.user.provider),
            eq(schema.users.providerId, session.user.providerId)
          )
        )
      : eq(schema.users.isPublic, true),
  ]
  if (query.name) {
    const esc = '\\'
    const escapedName = query.name
      .replaceAll(esc, `${esc}${esc}`)
      .replaceAll('%', `${esc}%`)
      .replaceAll('_', `${esc}_`)
    conditions.push(
      sql`${schema.users.name} LIKE ${`%${escapedName}%`} ESCAPE ${esc}`
    )
  }
  if (query.area !== undefined)
    conditions.push(eq(schema.users.area, query.area))
  if (query.code !== undefined)
    conditions.push(eq(schema.users.ddrCode, query.code))

  const result: User[] = await db.query.users.findMany({
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
        schema: { type: 'integer', minimum: 0, maximum: 118 },
        required: false,
        description: 'Area code',
        examples: {
          Undefined: { value: 0 },
          Australia: { value: 109 },
          Canada: { value: 106 },
          Europe: { value: 52 },
          France: { value: 115 },
          Germany: { value: 114 },
          HongKong: { value: 48 },
          Indonesia: { value: 117 },
          Italy: { value: 112 },
          Japan: { value: 105 },
          Korea: { value: 49 },
          NewZealand: { value: 110 },
          Philippines: { value: 118 },
          Portugal: { value: 116 },
          Singapore: { value: 107 },
          Spain: { value: 113 },
          Taiwan: { value: 50 },
          Thailand: { value: 108 },
          UK: { value: 111 },
          USA: { value: 51 },
          Overseas: { value: 53 },
          北海道: { value: 1 },
          青森県: { value: 2 },
          岩手県: { value: 3 },
          宮城県: { value: 4 },
          秋田県: { value: 5 },
          山形県: { value: 6 },
          福島県: { value: 7 },
          茨城県: { value: 8 },
          栃木県: { value: 9 },
          群馬県: { value: 10 },
          埼玉県: { value: 11 },
          千葉県: { value: 12 },
          東京都: { value: 13 },
          神奈川県: { value: 14 },
          新潟県: { value: 15 },
          富山県: { value: 16 },
          石川県: { value: 17 },
          福井県: { value: 18 },
          山梨県: { value: 19 },
          長野県: { value: 20 },
          岐阜県: { value: 21 },
          静岡県: { value: 22 },
          愛知県: { value: 23 },
          三重県: { value: 24 },
          滋賀県: { value: 25 },
          京都府: { value: 26 },
          大阪府: { value: 27 },
          兵庫県: { value: 28 },
          奈良県: { value: 29 },
          和歌山県: { value: 30 },
          鳥取県: { value: 31 },
          島根県: { value: 32 },
          岡山県: { value: 33 },
          広島県: { value: 34 },
          山口県: { value: 35 },
          徳島県: { value: 36 },
          香川県: { value: 37 },
          愛媛県: { value: 38 },
          高知県: { value: 39 },
          福岡県: { value: 40 },
          佐賀県: { value: 41 },
          長崎県: { value: 42 },
          熊本県: { value: 43 },
          大分県: { value: 44 },
          宮崎県: { value: 45 },
          鹿児島県: { value: 46 },
          沖縄県: { value: 47 },
          Alabama: { value: 55 },
          Alaska: { value: 54 },
          Arizona: { value: 57 },
          Arkansas: { value: 56 },
          California: { value: 58 },
          Colorado: { value: 59 },
          Connecticut: { value: 60 },
          Delaware: { value: 61 },
          Florida: { value: 62 },
          Georgia: { value: 63 },
          Hawaii: { value: 64 },
          Idaho: { value: 66 },
          Illinois: { value: 67 },
          Indiana: { value: 68 },
          Iowa: { value: 65 },
          Kansas: { value: 69 },
          Kentucky: { value: 70 },
          Louisiana: { value: 71 },
          Maine: { value: 74 },
          Maryland: { value: 73 },
          Massachusetts: { value: 72 },
          Michigan: { value: 75 },
          Minnesota: { value: 76 },
          Mississippi: { value: 78 },
          Missouri: { value: 77 },
          Montana: { value: 79 },
          Nebraska: { value: 80 },
          NorthCarolina: { value: 81 },
          NorthDakota: { value: 82 },
          NewHampshire: { value: 83 },
          NewJersey: { value: 84 },
          NewMexico: { value: 85 },
          NewYork: { value: 87 },
          Nevada: { value: 86 },
          Ohio: { value: 88 },
          Oklahoma: { value: 89 },
          Oregon: { value: 90 },
          Pennsylvania: { value: 91 },
          RhodeIsland: { value: 92 },
          SouthCarolina: { value: 93 },
          SouthDakot: { value: 94 },
          Tennessee: { value: 95 },
          Texas: { value: 96 },
          Utah: { value: 97 },
          Vermont: { value: 99 },
          Virginia: { value: 98 },
          Washington: { value: 100 },
          WashingtonDC: { value: 104 },
          WestVirginia: { value: 102 },
          Wisconsin: { value: 101 },
          Wyoming: { value: 103 },
        },
      },
      {
        in: 'query',
        name: 'code',
        schema: { type: 'integer', minimum: 10000000, maximum: 99999999 },
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
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'User ID',
                    // @ts-expect-error - pattern not provided in nitro types
                    pattern: '^[a-zA-Z0-9_-]{3,32}$',
                  },
                  name: {
                    type: 'string',
                    description: 'User name',
                  },
                  isPublic: {
                    type: 'boolean',
                    description: 'Whether the user profile is public',
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
      },
    },
  },
})
