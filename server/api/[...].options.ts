// Handle CORS preflight for /api/** routes
export default defineEventHandler(event => {
  setResponseStatus(event, 204)
})
