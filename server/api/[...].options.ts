import { defineEventHandler, setResponseStatus } from 'nuxt/server'

/**
 * Handle CORS preflight requests for /api/** routes
 */
export default defineEventHandler(event => {
  setResponseStatus(event, 204)
})
