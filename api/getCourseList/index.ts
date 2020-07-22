import { getContainer } from '../cosmos'
import type { CourseInfoSchema, CourseSchema } from '../db/songs'
import type { SuccessResult } from '../function'

type ShrinkedCourse = Pick<CourseSchema, 'id' | 'name' | 'series'> & {
  charts: Pick<CourseInfoSchema, 'playStyle' | 'difficulty' | 'level'>[]
}

/** Get course information list. */
export default async function (): Promise<SuccessResult<ShrinkedCourse[]>> {
  const container = getContainer('Songs', true)

  // Create SQL
  const courseColumns: (keyof ShrinkedCourse)[] = ['id', 'name', 'series']
  const orderColumns: (keyof CourseInfoSchema)[] = [
    'playStyle',
    'difficulty',
    'level',
  ]
  const joinColumn: keyof ShrinkedCourse = 'charts'

  const { resources } = await container.items
    .query<ShrinkedCourse>({
      query:
        `SELECT ${courseColumns.map(col => `c.${col}`).join(', ')}, ` +
        'ARRAY(' +
        `SELECT ${orderColumns.map(col => `o.${col}`).join(', ')} ` +
        `FROM o IN c.${joinColumn}` +
        `) as ${joinColumn} ` +
        'FROM c ' +
        'WHERE c.nameIndex = -1 OR c.nameIndex = -2 ' +
        'ORDER BY c.id',
    })
    .fetchAll()

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources,
  }
}
