import { fetchList } from '@ddradar/db'

export async function isCourse(songId: string): Promise<boolean> {
  const courseIds = await fetchList(
    'Songs',
    ['id'],
    [{ condition: 'c.nameIndex < 0' }],
    { _ts: 'ASC' }
  )
  return courseIds.map(d => d.id).includes(songId)
}
