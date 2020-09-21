import type { SqlParameter } from '@azure/cosmos'
import type { HttpRequest } from '@azure/functions'

import { getContainer } from '../db'
import { CourseInfoSchema, CourseSchema, SeriesList } from '../db/songs'
import type { SuccessResult } from '../function'

type ShrinkedCourse = Pick<CourseSchema, 'id' | 'name' | 'series'> & {
  charts: Pick<CourseInfoSchema, 'playStyle' | 'difficulty' | 'level'>[]
}

/** Get course information list. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>
): Promise<SuccessResult<ShrinkedCourse[]>> {
  // Parse search query
  const series = parseFloat(req.query.series)
  const type = parseFloat(req.query.type)
  const isValidSeries = series === 16 || series === 17
  const isValidType = type === 1 || type === 2

  const container = getContainer('Songs')

  // Create SQL
  const courseColumns: (keyof ShrinkedCourse)[] = ['id', 'name', 'series']
  const orderColumns: (keyof CourseInfoSchema)[] = [
    'playStyle',
    'difficulty',
    'level',
  ]
  const joinColumn: keyof ShrinkedCourse = 'charts'
  const orderByColumns: (keyof CourseSchema)[] = ['nameIndex', 'nameKana']
  const conditions: string[] = ['c.nameIndex < 0']
  const parameters: SqlParameter[] = []
  if (isValidType) {
    const col: keyof CourseSchema = 'nameIndex'
    conditions.push(`c.${col} = @${col}`)
    parameters.push({ name: `@${col}`, value: type * -1 })
  } else {
    const col: keyof CourseSchema = 'nameIndex'
    conditions.push(`c.${col} IN (-1, -2)`)
  }
  if (isValidSeries) {
    const col: keyof CourseSchema = 'series'
    conditions.push(`c.${col} = @${col}`)
    parameters.push({ name: `@${col}`, value: SeriesList[series] })
  }

  const { resources } = await container.items
    .query<ShrinkedCourse>({
      query:
        `SELECT ${courseColumns.map(col => `c.${col}`).join(', ')}, ` +
        'ARRAY(' +
        `  SELECT ${orderColumns.map(col => `o.${col}`).join(', ')} ` +
        `  FROM o IN c.${joinColumn}` +
        `) as ${joinColumn} ` +
        'FROM c ' +
        `WHERE ${conditions.join(' AND ')} ` +
        `ORDER BY ${orderByColumns.map(col => `c.${col}`).join(', ')}`,
      parameters,
    })
    .fetchAll()

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources,
  }
}
