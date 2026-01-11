import { nanoid } from 'nanoid'
import * as z from 'zod/mini'

import { apiTokenSchema } from '#shared/schemas/user'

/** Schema for runtimeConfig */
const _runtimeConfigSchema = z.catch(
  z.object({
    maxExpirationDays: z.coerce.number(),
    maxCreationPerUser: z.coerce.number(),
  }),
  { maxExpirationDays: 365, maxCreationPerUser: 10 }
)

/** Generate a secure random token */
function generateToken(): string {
  // Generate 32-byte random token (base64url encoded)
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Buffer.from(bytes).toString('base64url')
}

/** Hash token using SHA-256 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default defineEventHandler(async event => {
  const { maxExpirationDays, maxCreationPerUser } = _runtimeConfigSchema.parse(
    useRuntimeConfig(event).public.token
  )

  // Validate request body
  const body = await readValidatedBody(
    event,
    z.pick(apiTokenSchema, { name: true, expiresAt: true }).parse
  )

  // Require user session with registered user ID (not allow token-authenticated)
  const user = await requireAuthenticatedUserFromSession(event)

  const now = Date.now()
  const expiresAtMs = new Date(body.expiresAt).getTime()
  if (Number.isNaN(expiresAtMs)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid expiration date',
    })
  }
  if (expiresAtMs <= now) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Expiration must be in the future',
    })
  }
  if (expiresAtMs - now > maxExpirationDays * 24 * 60 * 60 * 1000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Expiration too far in the future',
    })
  }

  // Check existing token count (prefix-scan by user)
  const tokenKeys = await kv.keys(`user:${user.id}:token`)
  if (tokenKeys.length >= maxCreationPerUser) {
    throw createError({
      statusCode: 400,
      statusMessage: `Maximum ${maxCreationPerUser} tokens allowed per user`,
    })
  }

  // Generate token with hash-collision avoidance (extremely unlikely)
  let token: string | undefined
  let hashedToken: string | undefined
  let tokenId: string | undefined
  for (let i = 0; i < 5; i++) {
    const candidate = generateToken()
    const candidateHash = await hashToken(candidate)
    const reverseKey = `token:${candidateHash}`
    const existing = await kv.has(reverseKey)
    if (!existing) {
      token = candidate
      hashedToken = candidateHash
      tokenId = nanoid()
      // Store reverse mapping (token hash -> user/token info)
      await kv.set(reverseKey, { userId: user.id, tokenId })
      break
    }
  }

  if (!token || !hashedToken || !tokenId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate unique token',
    })
  }

  // Store token data
  await kv.set<StoredApiToken>(`user:${user.id}:token:${tokenId}`, {
    name: body.name,
    hashedToken,
    expiresAt: body.expiresAt,
    createdAt: new Date().toISOString(),
  })

  // Return plain token (only this time)
  return { token }
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            description:
              'API token authentication using Bearer token in Authorization header. ' +
              'Cannot be used to create or manage user/tokens.',
          },
        },
      },
    },
    summary: 'Create API Token',
    tags: ['API Token'],
    description:
      'Generate a new API token for the authenticated user. ' +
      'The token can be used for Bearer authentication in API requests. ' +
      'Maximum 10 tokens per user.',
    security: [{ SessionCookieAuth: [] }],
    requestBody: {
      description: 'Token configuration',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { $ref: '#/components/schemas/ApiToken/properties/name' },
              expiresAt: {
                $ref: '#/components/schemas/ApiToken/properties/expiresAt',
              },
            },
            required: ['name', 'expiresAt'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Token created successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description:
                    'Generated API token (shown only once, save it securely)',
                  example: 'abcdef1234567890...',
                },
              },
              required: ['token'],
            },
          },
        },
      },
      400: {
        description:
          'Bad Request - Expiration date is invalid or maximum token limit reached',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      401: { $ref: '#/components/responses/Unauthorized' },
      403: { $ref: '#/components/responses/RegistrationRequired' },
    },
  },
})
