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
