import * as z from 'zod/mini'

/**
 * Returns the key of the specified enum value
 * @param enumObj Enum object
 * @param value Enum value
 * @returns Enum key or undefined if not found
 */
export function getEnumKey<TValue, TEnum extends Record<string, TValue>>(
  enumObj: TEnum,
  value: TValue
): keyof TEnum | undefined {
  return Object.entries(enumObj).find(([, v]) => v === value)?.[0]
}

/**
 * Returns an array of numbers in the specified range (inclusive)
 * @param start Start number
 * @param end End number
 * @returns Array of numbers from start to end
 */
export function range<T extends number>(start: T, end: T): T[] {
  return [...Array(end - start + 1).keys()].map(i => (i + start) as T)
}

/**
 * Divides an array into chunks of the specified size
 * @param array Input array
 * @param size Chunk size
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < array.length; i += size)
    out.push(array.slice(i, i + size))
  return out
}

/**
 * Asserts that the specified properties of an object are not null or undefined
 * @param obj object to assert
 * @param keys property keys to check
 * @returns true if all specified properties are not null or undefined, false otherwise
 */
export function isPropertyNotNull<T, K extends keyof T>(
  obj: T,
  ...keys: K[]
): obj is T & { [P in K]-?: NonNullable<T[P]> } {
  for (const key of keys) {
    if (obj[key] == null) return false
  }
  return true
}

/**
 * Returns a Zod schema that accepts either a single value or an array of values
 * @param schema Zod schema for the value type
 */
export function singleOrArray<T extends z.ZodMiniType>(schema: T) {
  return z.union([schema, z.array(schema)])
}
