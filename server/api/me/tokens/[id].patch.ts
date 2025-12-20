import * as z from 'zod/mini'

/** Schema for runtimeConfig */
const _runtimeConfigSchema = z.catch(
  z.object({ maxExpirationDays: z.coerce.number() }),
  { maxExpirationDays: 365 }
)

export default eventHandler(async event => {
  const { maxExpirationDays } = _runtimeConfigSchema.parse(
    useRuntimeConfig(event).public.token
  )

  // Require user session with registered user ID
  const { user } = await requireUserSession(event)
  if (!user?.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User registration required',
    })
  }

  const { id: tokenId } = await getValidatedRouterParams(
    event,
    z.pick(apiTokenSchema, { id: true }).parse
  )
  const body = await readValidatedBody(
    event,
    z.pick(apiTokenSchema, { expiresAt: true }).parse
  )

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

  // Get token data
  const tokenKey = `user:${user.id}:token:${tokenId}`
  const tokenData = await kv.get<StoredApiToken>(tokenKey)

  if (!tokenData) {
    throw createError({ statusCode: 404, statusMessage: 'Token not found' })
  }

  // Update expiration date
  const updatedTokenData = { ...tokenData, expiresAt: body.expiresAt }
  await kv.set(tokenKey, updatedTokenData)

  // Return updated token info (without hashedToken)
  return {
    id: tokenId,
    name: updatedTokenData.name,
    createdAt: updatedTokenData.createdAt,
    expiresAt: updatedTokenData.expiresAt,
  } satisfies ApiToken
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    summary: 'Update API Token',
    tags: ['API Token'],
    description: 'Extend the expiration date of a specific API token.',
    security: [{ SessionCookieAuth: [] }],
    parameters: [
      {
        in: 'path',
        name: 'id',
        schema: { type: 'string' },
        required: true,
        description: 'Token ID',
        example: 'abc123',
      },
    ],
    requestBody: {
      description: 'Updated token configuration',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              expiresAt: {
                type: 'string',
                format: 'date-time',
                description: 'New expiration date (ISO 8601 format)',
                example: '2027-01-01T00:00:00Z',
              },
            },
            required: ['expiresAt'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Token updated successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Token ID' },
                name: { type: 'string', description: 'Token name' },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Token creation date',
                },
                expiresAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Token expiration date',
                },
              },
              required: ['id', 'name', 'createdAt', 'expiresAt'],
            },
          },
        },
      },
      400: {
        description: 'Bad Request - Token ID is required or invalid body',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      401: { $ref: '#/components/responses/Unauthorized' },
      403: {
        description: 'Forbidden - User registration required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      404: {
        description: 'Token not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  },
})
