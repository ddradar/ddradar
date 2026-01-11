import type { SelectItem } from '@nuxt/ui'

/**
 * Generate USelect items from an enum object.
 * @param enumObj - The enum object to convert.
 */
export function getSelectItems(
  enumObj: Record<string, string | number>
): SelectItem[] {
  return Object.entries(enumObj).map(([label, value]) => ({ label, value }))
}
