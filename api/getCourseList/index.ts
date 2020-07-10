import { getContainer } from '../cosmos'
import type { CourseSchema, Order } from '../db/courses'
import type { SuccessResult } from '../function'

type ShrinkedCourse = Omit<CourseSchema, 'orders'> & {
  orders: Omit<Order, 'chartOrder'>[]
}

/** Get course information list. */
export default async function (): Promise<SuccessResult<ShrinkedCourse[]>> {
  const container = getContainer('Courses', true)

  // Create SQL
  const courseColumns: (keyof ShrinkedCourse)[] = ['id', 'name', 'series']
  const orderColumns: (keyof Order)[] = ['playStyle', 'difficulty', 'level']
  const joinColumn: keyof ShrinkedCourse = 'orders'

  const { resources } = await container.items
    .query<ShrinkedCourse>({
      query:
        `SELECT ${courseColumns.map(col => `c.${col}`).join(', ')}, ` +
        'ARRAY(' +
        `SELECT ${orderColumns.map(col => `o.${col}`).join(', ')} ` +
        `FROM o IN c.${joinColumn}` +
        `) as ${joinColumn} ` +
        'FROM c',
    })
    .fetchAll()

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources,
  }
}
