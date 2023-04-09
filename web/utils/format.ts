import MarkdownIt from 'markdown-it'

export function unixTimeToString(unixTime: number): string {
  return new Date(unixTime * 1000).toLocaleString()
}

const parser = new MarkdownIt()

export function markdownToHTML(markdown: string): string {
  return parser.render(markdown)
}
