import { config } from 'dotenv'

// load .env file
config()

import type { Database } from '@ddradar/core'
import { fetchList, fetchOne } from '@ddradar/db'

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

export async function fetchUser(code: number) {
  const user = (await fetchOne('Users', ['id', 'name', 'password'], {
    condition: 'c.code = @',
    value: code,
  })) as Required<Pick<Database.UserSchema, 'id' | 'name' | 'password'>>
  return user?.password ? user : null
}
