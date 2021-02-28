import type { SongInfo } from '@ddradar/core/api/song'

type SuccessResult = {
  status: 200
  body: SongInfo[]
}

/** Get songs and charts information*/
export default async function (
  _context: unknown,
  _req: unknown,
  body: SongInfo[]
): Promise<SuccessResult> {
  return { status: 200, body }
}
