import type { AzureFunction, Context } from '@azure/functions'

import { getContainer } from '../cosmos'
import { CourseSchema, Order } from '../course'

/** Get course information list. */
const httpTrigger: AzureFunction = async (
  context: Pick<Context, 'res'>
): Promise<void> => {
  const container = getContainer('Courses', true)

  // Create SQL
  const courseColumns: (keyof CourseSchema)[] = ['id', 'name']
  const orderColumns: (keyof Order)[] = ['playStyle', 'difficulty', 'level']
  const joinColumn: keyof CourseSchema = 'orders'

  const { resources } = await container.items
    .query<CourseSchema>({
      query:
        `SELECT ${courseColumns.map(col => `c.${col}`).join(', ')}, ` +
        'ARRAY(' +
        `SELECT ${orderColumns.map(col => `o.${col}`).join(', ')} ` +
        `FROM o IN c.${joinColumn}` +
        `) as ${joinColumn} ` +
        'FROM c',
    })
    .fetchAll()

  if (resources.length === 0) {
    context.res = {
      status: 404,
      body: `Not found courses`,
    }
    return
  }

  context.res = {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources,
  }
}

export default httpTrigger
