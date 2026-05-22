import type { CheerioAPI } from 'cheerio'

/**
 * Get trimmed text content from a cheerio element.
 */
export function getTextContent(
  $: CheerioAPI,
  element: Parameters<CheerioAPI>[0] | null | undefined
): string {
  if (!element) return ''
  return $(element).text().trim()
}

/**
 * Get number content from a cheerio element.
 */
export function getNumberContent<T extends number = number>(
  $: CheerioAPI,
  element: Parameters<CheerioAPI>[0] | null | undefined,
  defaultValue: T
): T {
  const value = parseInt(getTextContent($, element), 10) as T
  return Number.isNaN(value) ? defaultValue : value
}
