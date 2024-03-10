import MarkdownIt from 'markdown-it'

import type {} from '#ui/types'

export function unixTimeToString(unixTime: number): string {
  return new Date(unixTime * 1000).toLocaleString()
}

const parser = new MarkdownIt()

export function markdownToHTML(markdown: string): string {
  return parser.render(markdown)
}

export const toSelectOptions = <
  TKey extends number | string,
  TValue extends string,
>(
  map: ReadonlyMap<TKey, TValue>
): { value: TKey; label: TValue }[] =>
  [...map.entries()].map(([value, label]) => ({ value, label }))
