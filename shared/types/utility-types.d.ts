import type { infer as zodInfer } from 'zod/mini'

export type KeyOfMap<T> = T extends Map<infer K, unknown> ? K : never

export type ValueOf<TEnum extends object> = TEnum[keyof TEnum]

type OmitUnknown<T> = {
  [K in keyof T as unknown extends T[K] ? never : K]: T[K]
}
export type ZodInfer<T> = OmitUnknown<zodInfer<T>>

export type NonNullableProps<T> = Required<{
  [K in keyof T]: NonNullable<T[K]>
}>

/** Pagenated result */
export type Pagenation<T> = {
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
