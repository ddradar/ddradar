import * as z from 'zod/mini'

import { userSchema } from '#shared/schemas/user'

/** Schema for router params */
const _paramsSchema = z.pick(userSchema, { id: true })

export default defineEventHandler(async event => {
  const { id } = await getValidatedRouterParams(event, _paramsSchema.parse)
  const loginUser = await getAuthenticatedUser(event)

  const user = await getCachedUser(event, id)
  // Handle user visibility (user must be public or logged-in as the user)
  if (!user || (!user.isPublic && user.id !== loginUser?.id))
    throw createError({ status: 404, statusText: 'Not Found' })

  return user
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          AreaCode: {
            type: 'integer',
            description: 'Area code',
            oneOf: [
              { type: 'integer', const: 0, description: 'Undefined' },
              { type: 'integer', const: 1, description: '北海道' },
              { type: 'integer', const: 2, description: '青森県' },
              { type: 'integer', const: 3, description: '岩手県' },
              { type: 'integer', const: 4, description: '宮城県' },
              { type: 'integer', const: 5, description: '秋田県' },
              { type: 'integer', const: 6, description: '山形県' },
              { type: 'integer', const: 7, description: '福島県' },
              { type: 'integer', const: 8, description: '茨城県' },
              { type: 'integer', const: 9, description: '栃木県' },
              { type: 'integer', const: 10, description: '群馬県' },
              { type: 'integer', const: 11, description: '埼玉県' },
              { type: 'integer', const: 12, description: '千葉県' },
              { type: 'integer', const: 13, description: '東京都' },
              { type: 'integer', const: 14, description: '神奈川県' },
              { type: 'integer', const: 15, description: '新潟県' },
              { type: 'integer', const: 16, description: '富山県' },
              { type: 'integer', const: 17, description: '石川県' },
              { type: 'integer', const: 18, description: '福井県' },
              { type: 'integer', const: 19, description: '山梨県' },
              { type: 'integer', const: 20, description: '長野県' },
              { type: 'integer', const: 21, description: '岐阜県' },
              { type: 'integer', const: 22, description: '静岡県' },
              { type: 'integer', const: 23, description: '愛知県' },
              { type: 'integer', const: 24, description: '三重県' },
              { type: 'integer', const: 25, description: '滋賀県' },
              { type: 'integer', const: 26, description: '京都府' },
              { type: 'integer', const: 27, description: '大阪府' },
              { type: 'integer', const: 28, description: '兵庫県' },
              { type: 'integer', const: 29, description: '奈良県' },
              { type: 'integer', const: 30, description: '和歌山県' },
              { type: 'integer', const: 31, description: '鳥取県' },
              { type: 'integer', const: 32, description: '島根県' },
              { type: 'integer', const: 33, description: '岡山県' },
              { type: 'integer', const: 34, description: '広島県' },
              { type: 'integer', const: 35, description: '山口県' },
              { type: 'integer', const: 36, description: '徳島県' },
              { type: 'integer', const: 37, description: '香川県' },
              { type: 'integer', const: 38, description: '愛媛県' },
              { type: 'integer', const: 39, description: '高知県' },
              { type: 'integer', const: 40, description: '福岡県' },
              { type: 'integer', const: 41, description: '佐賀県' },
              { type: 'integer', const: 42, description: '長崎県' },
              { type: 'integer', const: 43, description: '熊本県' },
              { type: 'integer', const: 44, description: '大分県' },
              { type: 'integer', const: 45, description: '宮崎県' },
              { type: 'integer', const: 46, description: '鹿児島県' },
              { type: 'integer', const: 47, description: '沖縄県' },
              { type: 'integer', const: 48, description: 'HongKong' },
              { type: 'integer', const: 49, description: 'Korea' },
              { type: 'integer', const: 50, description: 'Taiwan' },
              { type: 'integer', const: 51, description: 'USA' },
              { type: 'integer', const: 52, description: 'Europe' },
              { type: 'integer', const: 53, description: 'Overseas' },
              { type: 'integer', const: 54, description: 'Alaska' },
              { type: 'integer', const: 55, description: 'Alabama' },
              { type: 'integer', const: 56, description: 'Arkansas' },
              { type: 'integer', const: 57, description: 'Arizona' },
              { type: 'integer', const: 58, description: 'California' },
              { type: 'integer', const: 59, description: 'Colorado' },
              { type: 'integer', const: 60, description: 'Connecticut' },
              { type: 'integer', const: 61, description: 'Delaware' },
              { type: 'integer', const: 62, description: 'Florida' },
              { type: 'integer', const: 63, description: 'Georgia' },
              { type: 'integer', const: 64, description: 'Hawaii' },
              { type: 'integer', const: 65, description: 'Iowa' },
              { type: 'integer', const: 66, description: 'Idaho' },
              { type: 'integer', const: 67, description: 'Illinois' },
              { type: 'integer', const: 68, description: 'Indiana' },
              { type: 'integer', const: 69, description: 'Kansas' },
              { type: 'integer', const: 70, description: 'Kentucky' },
              { type: 'integer', const: 71, description: 'Louisiana' },
              { type: 'integer', const: 72, description: 'Massachusetts' },
              { type: 'integer', const: 73, description: 'Maryland' },
              { type: 'integer', const: 74, description: 'Maine' },
              { type: 'integer', const: 75, description: 'Michigan' },
              { type: 'integer', const: 76, description: 'Minnesota' },
              { type: 'integer', const: 77, description: 'Missouri' },
              { type: 'integer', const: 78, description: 'Mississippi' },
              { type: 'integer', const: 79, description: 'Montana' },
              { type: 'integer', const: 80, description: 'Nebraska' },
              { type: 'integer', const: 81, description: 'NorthCarolina' },
              { type: 'integer', const: 82, description: 'NorthDakota' },
              { type: 'integer', const: 83, description: 'NewHampshire' },
              { type: 'integer', const: 84, description: 'NewJersey' },
              { type: 'integer', const: 85, description: 'NewMexico' },
              { type: 'integer', const: 86, description: 'Nevada' },
              { type: 'integer', const: 87, description: 'NewYork' },
              { type: 'integer', const: 88, description: 'Ohio' },
              { type: 'integer', const: 89, description: 'Oklahoma' },
              { type: 'integer', const: 90, description: 'Oregon' },
              { type: 'integer', const: 91, description: 'Pennsylvania' },
              { type: 'integer', const: 92, description: 'RhodeIsland' },
              { type: 'integer', const: 93, description: 'SouthCarolina' },
              { type: 'integer', const: 94, description: 'SouthDakot' },
              { type: 'integer', const: 95, description: 'Tennessee' },
              { type: 'integer', const: 96, description: 'Texas' },
              { type: 'integer', const: 97, description: 'Utah' },
              { type: 'integer', const: 98, description: 'Virginia' },
              { type: 'integer', const: 99, description: 'Vermont' },
              { type: 'integer', const: 100, description: 'Washington' },
              { type: 'integer', const: 101, description: 'Wisconsin' },
              { type: 'integer', const: 102, description: 'WestVirginia' },
              { type: 'integer', const: 103, description: 'Wyoming' },
              { type: 'integer', const: 104, description: 'WashingtonDC' },
              { type: 'integer', const: 105, description: 'Japan' },
              { type: 'integer', const: 106, description: 'Canada' },
              { type: 'integer', const: 107, description: 'Singapore' },
              { type: 'integer', const: 108, description: 'Thailand' },
              { type: 'integer', const: 109, description: 'Australia' },
              { type: 'integer', const: 110, description: 'NewZealand' },
              { type: 'integer', const: 111, description: 'UK' },
              { type: 'integer', const: 112, description: 'Italy' },
              { type: 'integer', const: 113, description: 'Spain' },
              { type: 'integer', const: 114, description: 'Germany' },
              { type: 'integer', const: 115, description: 'France' },
              { type: 'integer', const: 116, description: 'Portugal' },
              { type: 'integer', const: 117, description: 'Indonesia' },
              { type: 'integer', const: 118, description: 'Philippines' },
            ],
          },
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
              area: { $ref: '#/components/schemas/AreaCode' },
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
        $ref: '#/components/responses/Error',
        description: 'User not found or not accessible',
      },
    },
  },
})
