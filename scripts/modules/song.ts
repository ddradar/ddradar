import { fetchList } from '@ddradar/db'

let courseIds: string[] = []

export async function isCourse(songId: string): Promise<boolean> {
  if (courseIds.length === 0)
    courseIds = (
      await fetchList('Songs', ['id'], [{ condition: 'c.nameIndex < 0' }], {
        _ts: 'ASC',
      })
    ).map(d => d.id)
  return courseIds.includes(songId)
}
