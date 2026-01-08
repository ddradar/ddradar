import type { SelectItem } from '@nuxt/ui'

export function getSelectItems(
  enumObj: Record<string, string | number>
): SelectItem[] {
  return Object.entries(enumObj).map(([label, value]) => ({ label, value }))
}
