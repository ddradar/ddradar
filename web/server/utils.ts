import { createError, sendError } from 'h3'

/**
 * Returns null and send H3Error.
 * @param event HTTP Event
 * @param statusCode HTTP Status code
 * @param message Error message (optional)
 */
export function sendNullWithError(
  event: Parameters<typeof sendError>[0],
  statusCode: number,
  message?: string
) {
  sendError(event, createError({ statusCode, message }))
  return null
}
