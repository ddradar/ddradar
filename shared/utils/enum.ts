export function getEnumKey<TValue, TEnum extends Record<string, TValue>>(
  enumObj: TEnum,
  value: TValue
): string | undefined {
  return Object.entries(enumObj).find(([, v]) => v === value)?.[0]
}
