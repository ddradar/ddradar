import type { SongInfo } from '@ddradar/core/api/song'

/** Get songs and charts information*/
export default async function (
  _context: unknown,
  _req: unknown,
  songs: SongInfo[]
): Promise<SongInfo[]> {
  return songs
}
