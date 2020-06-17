import type { AzureFunction, Context } from '@azure/functions'

import { getContainer } from '../cosmos'
import { CourseSchema, Order } from '../db/courses'

type ShrinkedCourse = Omit<CourseSchema, 'orders'> & {
  orders: Omit<Order, 'chartOrder'>[]
}

/** Get course information list. */
const httpTrigger: AzureFunction = async (
  context: Pick<Context, 'res'>
): Promise<void> => {
  const container = getContainer('Courses', true)

  // Create SQL
  const courseColumns: (keyof ShrinkedCourse)[] = ['id', 'name']
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

  context.res = {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources,
  }
}

export default httpTrigger
