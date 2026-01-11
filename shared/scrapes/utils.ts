/**
 * Get trimmed text content of an element.
 * @param element Element to get text content from.
 * @returns Trimmed `.textContent`, or empty string if element is null/undefined.
 */
export function getTextContent(element: Element | null | undefined): string {
  return element?.textContent?.trim() || ''
}

/**
 * Get number content from an element.
 * @param element Element to get number content from.
 * @param defaultValue Default value to return if parsing fails.
 * @returns Parsed number or default value if parsing fails.
 */
export function getNumberContent<T extends number = number>(
  element: Element | null | undefined,
  defaultValue: T
): T {
  const value = parseInt(getTextContent(element), 10) as T
  return Number.isNaN(value) ? defaultValue : value
}
