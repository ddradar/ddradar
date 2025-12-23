export default eventHandler(async event => {
  // Require user session with registered user ID (not allow token-authenticated)
  const user = await requireAuthenticatedUserFromSession(event)

  // Prefix-scan token keys for the user
  const tokenKeys = await kv.keys(`user:${user.id}:token`)

  // Fetch all token details
  const tokens = await Promise.all<ApiToken | null>(
    tokenKeys.map(async key => {
      const tokenData = await kv.get<StoredApiToken>(key)

      if (!tokenData) return null

      const tokenId = key.split(':').pop() || ''
      if (!tokenId) return null

      // Return without hashedToken
      return {
        id: tokenId,
        name: tokenData.name,
        createdAt: tokenData.createdAt,
        expiresAt: tokenData.expiresAt,
      }
    })
  )
  return tokens.filter(Boolean) as ApiToken[]
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          ApiToken: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Token ID (auto-generated, 21 characters)',
                example: 'abc123def456ghi789jkl',
              },
              name: {
                type: 'string',
                description: 'Token name (up to 50 characters)',
                example: 'My API Token',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Token creation date (ISO 8601 format)',
                example: '2025-12-20T10:00:00Z',
              },
              expiresAt: {
                type: 'string',
                format: 'date-time',
                description: 'Token expiration date (ISO 8601 format)',
                example: '2026-12-20T10:00:00Z',
              },
            },
            required: ['id', 'name', 'createdAt', 'expiresAt'],
          },
        },
        responses: {
          RegistrationRequired: {
            $ref: '#/components/responses/Error',
            description: 'Forbidden - User registration required',
          },
        },
      },
    },
    summary: 'List API Tokens',
    tags: ['API Token'],
    description: 'Get a list of all API tokens for the authenticated user.',
    security: [{ SessionCookieAuth: [] }],
    responses: {
      200: {
        description: 'List of API tokens',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/ApiToken' },
            },
          },
        },
      },
      401: { $ref: '#/components/responses/Unauthorized' },
      403: { $ref: '#/components/responses/RegistrationRequired' },
    },
  },
})
