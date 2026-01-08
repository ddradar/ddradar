// Handle CORS preflight for /api/** routes
export default defineEventHandler(event => {
  setResponseStatus(event, 204)
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    summary: 'CORS preflight handler for /api/** routes',
    parameters: [
      {
        in: 'path',
        name: 'param1',
        schema: { type: 'string' },
        description: 'API path to handle CORS preflight',
      },
    ],
    responses: { 204: { description: 'No Content' } },
  },
})
