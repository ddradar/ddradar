export function unixTimeToString(unixTime: number): string {
  return new Date(unixTime * 1000).toLocaleString()
}
