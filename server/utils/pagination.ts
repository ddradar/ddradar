/**
 * Build a `Pagenation<T>` result from a raw item list fetched with `limit + 1`.
 * @param rawItems Items fetched from DB with `limit + 1` items to detect if more pages exist
 * @param limit Page size (must match the `limit` used in the DB query)
 * @param offset Current offset
 */
export function buildPagenation<T>(
  rawItems: T[],
  limit: number,
  offset: number
): Pagenation<T> {
  console.assert(
    rawItems.length <= limit + 1,
    `buildPagenation: rawItems.length (${rawItems.length}) must be <= limit + 1 (${limit + 1})`
  )
  const hasMore = rawItems.length > limit
  return {
    items: rawItems.slice(0, limit),
    limit,
    offset,
    nextOffset: hasMore ? offset + limit : null,
    hasMore,
  }
}
