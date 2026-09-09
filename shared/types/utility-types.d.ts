export type KeyOfMap<T> = T extends Map<infer K, unknown> ? K : never

export type ValueOf<TEnum extends object> = TEnum[keyof TEnum]

export type NonNullableProps<T> = Required<{
  [K in keyof T]: NonNullable<T[K]>
}>

/** Pagenated result */
export interface Pagenation<T> {
  /** List of items on the current page */
  items: T[]
  /** Maximum number of items to return (page size) */
  limit: number
  /** Current offset */
  offset: number
  /** Next offset, or `null` if there are no more items */
  nextOffset: number | null
  /** Whether there are more items beyond the current page */
  hasMore: boolean
}
