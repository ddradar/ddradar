import { and, eq, or } from 'drizzle-orm'
import * as z from 'zod/mini'

import { type User, userSchema } from '~~/shared/types/user'

/** Schema for router params */
const _paramsSchema = z.pick(userSchema, { id: true })

// Never use `cachedEventHandler` because user privacy settings may change
export default defineEventHandler(async event => {
  const { id } = await getValidatedRouterParams(event, _paramsSchema.parse)
  const session = await getUserSession(event)

  const conditions = [
    and(eq(schema.users.id, id), eq(schema.users.isPublic, true)),
  ]
  if (session.user) {
    // Logged-in user can access their own data regardless of `isPublic`
    conditions.push(
      and(
        eq(schema.users.id, id),
        eq(schema.users.provider, session.user.provider),
        eq(schema.users.providerId, session.user.providerId)
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
    summary: 'Get User Details by ID',
    tags: ['User'],
    description:
      'Retrieve detailed information about a user by their ID. ' +
      'If the user profile is not public, authentication is required to access the data.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        schema: { type: 'string' },
        required: true,
        description: 'User ID',
        example: 'example_user',
      },
    ],
    responses: {
      200: {
        description: 'User details',
        content: {
          'application/json': {
            schema: {
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
                  description:
                    'Whether the user profile and scores are public or private',
                },
                area: {
                  type: 'integer',
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
      404: {
        description: 'User not found',
      },
    },
  },
})
