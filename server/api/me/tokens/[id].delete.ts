import * as z from 'zod/mini'

import { apiTokenSchema } from '#shared/schemas/user'

export default defineEventHandler(async event => {
  const { id: tokenId } = await getValidatedRouterParams(
    event,
    z.pick(apiTokenSchema, { id: true }).parse
  )

  // Require user session with registered user ID (not allow token-authenticated)
  const user = await requireAuthenticatedUserFromSession(event)

  // Get token data
  const tokenKey = `user:${user.id}:token:${tokenId}`
  const tokenData = await kv.get<StoredApiToken>(tokenKey)

  if (!tokenData)
    throw createError({ status: 404, statusText: 'Token not found' })

  // Delete reverse mapping
  await kv.del(`token:${tokenData.hashedToken}`)

  // Delete token data
  await kv.del(tokenKey)

  // Return 204 No Content
  setResponseStatus(event, 204)
  return null
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    summary: 'Delete API Token',
    tags: ['API Token'],
    description: 'Delete a specific API token by its ID.',
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
    responses: {
      204: {
        description: 'Token deleted successfully',
      },
      400: {
        description: 'Bad Request - Token ID is required',
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
