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
): string | undefined {
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

export function chunkArray<T>(array: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < array.length; i += size)
    out.push(array.slice(i, i + size))
  return out
}

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
