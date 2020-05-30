import { CosmosClient } from '@azure/cosmos'
import type { AzureFunction, Context, HttpRequest } from '@azure/functions'

const httpTrigger: AzureFunction = async (
  context: Context,
  req: HttpRequest
): Promise<void> => {
  context.log('HTTP trigger function processed a request.')
  const id = req.query.id

  if (!id) {
    context.res = {
      status: 400,
      body: 'Please pass a id on the query string',
    }
    return
  }

  // eslint-disable-next-line node/no-process-env
  const connectionString = process.env.COSMOS_DB_CONN
  if (!connectionString) {
    context.res = {
      status: 500,
      body: 'Internal Server Error',
    }
    return
  }

  const client = new CosmosClient(connectionString)
  const container = client.database('DDRadar').container('Songs')

  const { resources } = await container.items
    .query({
      query: 'SELECT * FROM Songs c WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }],
    })
    .fetchAll()

  if (resources.length === 0) {
    context.res = {
      status: 404,
      body: `Not found song that id: "${id}"`,
    }
    return
  }

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: resources[0],
  }
}

export default httpTrigger
