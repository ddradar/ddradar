import { CosmosClient } from '@azure/cosmos'
import type { AzureFunction, Context, HttpRequest } from '@azure/functions'

import { SongSchema } from '../song'

type SongInfoResponse =
  | {
      status: number
      body: string
    }
  | {
      status: 200
      body: SongSchema
    }

const httpTrigger: AzureFunction = async (
  context: Context,
  req: HttpRequest
): Promise<SongInfoResponse> => {
  context.log('HTTP trigger function processed a request.')
  const id = req.query.id

  if (!id) {
    return {
      status: 400,
      body: 'Please pass a id on the query string',
    }
  }

  // eslint-disable-next-line node/no-process-env
  const connectionString = process.env.COSMOS_DB_CONN
  if (!connectionString) {
    return {
      status: 500,
      body: 'Internal Server Error',
    }
  }

  const client = new CosmosClient(connectionString)
  const container = client.database('DDRadar').container('Songs')
  const { resources } = await container.items
    .query<SongSchema>({
      query: 'SELECT * FROM Songs c WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }],
    })
    .fetchAll()

  if (resources.length === 0)
    return {
      status: 404,
      body: `Not found song that id: "${id}"`,
    }

  return {
    status: 200,
    body: resources[0],
  }
}

export default httpTrigger
