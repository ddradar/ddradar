import type { useQuery } from 'h3'
import type { LocationQuery } from 'vue-router'

/**
 * Get string value from query object.
 * @param query Query object
 * @param key Query key
 * @returns String value (if multiple query, returns last value)
 */
export function getQueryString(
  query: ReturnType<typeof useQuery> | LocationQuery,
  key: string
) {
  const value = query[key]
  return Array.isArray(value) ? value[value.length - 1] : value
}

/**
 * Get integer value from query object.
 * @param query Query object
 * @param key Query key
 * @returns Integer value or NaN
 */
export function getQueryInteger(
  query: ReturnType<typeof useQuery> | LocationQuery,
  key: string
) {
  const value = getQueryString(query, key)
  if (!value) return NaN
  const num = parseFloat(value)
  return Number.isInteger(num) ? num : NaN
}
