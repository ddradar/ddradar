import { kv } from '@nuxthub/kv'
import * as z from 'zod/mini'

import { apiTokenSchema } from '#shared/schemas/user'
import { getTokenConfig } from '~~/server/utils/auth'

/** Schema for route params */
const paramsSchema = z.compile(z.pick(apiTokenSchema, { id: true }))
/** Schema for request body */
const bodySchema = z.compile(z.pick(apiTokenSchema, { expiresAt: true }))

export default defineEventHandler(async event => {
  const { maxExpirationDays } = getTokenConfig(event)

  // Validate route params and body
  const { id: tokenId } = await getValidatedRouterParams(event, i =>
    paramsSchema.parse(i)
  )
  const body = await readValidatedBody(event, i => bodySchema.parse(i))

  // Require user session with registered user ID (not allow token-authenticated)
  const user = await requireAuthenticatedUserFromSession(event)

  const now = Date.now()
  const expiresAtMs = new Date(body.expiresAt).getTime()
  if (Number.isNaN(expiresAtMs)) {
    throw createError({ status: 400, statusText: 'Invalid expiration date' })
  }
  if (expiresAtMs <= now) {
    throw createError({
      status: 400,
      statusText: 'Expiration must be in the future',
    })
  }
  if (expiresAtMs - now > maxExpirationDays * 24 * 60 * 60 * 1000) {
    throw createError({
      status: 400,
      statusText: 'Expiration too far in the future',
    })
  }

  // Get token data
  const tokenKey = `user:${user.id}:token:${tokenId}`
  const tokenData = await kv.get<StoredApiToken>(tokenKey)

  if (!tokenData) {
    throw createError({ status: 404, statusText: 'Token not found' })
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
      403: { $ref: '#/components/responses/RegistrationRequired' },
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
