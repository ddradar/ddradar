import { createError, sendError } from 'h3'
import type { QueryObject } from 'ufo'

/**
 * Get string value from query object.
 * @param query Query object (returned by `useQuery(event)`)
 * @param key Query key
 * @returns Query value (if multiple, returns last value)
 */
export function getQueryString(query: QueryObject, key: string) {
  const value = query[key]
  return Array.isArray(value) ? value[value.length - 1] : value
}

/**
 * Get integer value from query object.
 * @param query Query object (returned by `useQuery(event)`)
 * @param key Query key
 * @returns Integer value or NaN
 */
export function getQueryInteger(query: QueryObject, key: string) {
  const value = getQueryString(query, key)
  if (value === undefined) return NaN
  const num = parseFloat(value)
  return Number.isInteger(num) ? num : NaN
}

/**
 * Returns null and send H3Error.
 * @param event HTTP Event
 * @param statusCode HTTP Status code
 * @param message Error message (optional)
 * @returns Integer value or NaN
 */
export function sendNullWithError(
  event: Parameters<typeof sendError>[0],
  statusCode: number,
  message?: string
) {
  sendError(event, createError({ statusCode, message }))
  return null
}
