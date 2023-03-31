import { config } from 'dotenv'

// load .env file
config()

import { fetchList, fetchOne } from '@ddradar/db'
import type { UserSchema } from '@ddradar/db-definitions'

let courseIds: string[] = []

export async function isCourse(songId: string): Promise<boolean> {
  if (courseIds.length === 0)
    courseIds = (
      await fetchList('Songs', ['id'], [{ condition: 'c.nameIndex < 0' }])
    ).map(d => d.id)
  return courseIds.includes(songId)
}

export async function fetchUser(code: number) {
  const user = (await fetchOne('Users', ['id', 'name', 'password'], {
    condition: 'c.code = @',
    value: code,
  })) as Required<Pick<UserSchema, 'id' | 'name' | 'password'>>
  return user?.password ? user : null
}

export async function fetchSongs(songIds: string[]) {
  const resources = await fetchList(
    'Songs',
    ['id', 'name', 'nameIndex', 'charts', 'minBPM', 'maxBPM'],
    [
      { condition: 'ARRAY_CONTAINS(@, c.id)', value: songIds },
      { condition: 'c.nameIndex >= 0' },
    ]
  )

  if (resources.length !== songIds.length) {
    throw new RangeError(
      `Not found ${songIds.length} songs. Please check has been registered.`
    )
  }
  return resources.sort((l, r) => songIds.indexOf(l.id) - songIds.indexOf(r.id))
}
