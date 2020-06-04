import { CosmosClient } from '@azure/cosmos'
import type { AzureFunction, Context } from '@azure/functions'

import { SongSchema } from '../song'

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const id = context.bindingData.id

  if (!id) {
    context.res = {
      status: 404,
      body: 'Please pass a id like "/api/songs/:id"',
    }
    return
  }

  // eslint-disable-next-line node/no-process-env
  const connectionString = process.env.COSMOS_DB_CONN
  if (!connectionString) {
    context.log.error(
      'Connection string is not set in process.env.COSMOS_DB_CONN'
    )
    context.res = {
      status: 500,
      body: 'Internal Server Error',
    }
    return
  }

  const client = new CosmosClient(connectionString)
  const container = client.database('DDRadar').container('Songs')
  const { resources } = await container.items
    .query<SongSchema>({
      query:
        'SELECT c.id, c.name, c.nameKana, c.nameIndex, ' +
        'c.artist, c.series, c.minBPM, c.maxBPM, c.charts ' +
        'FROM c ' +
        'WHERE c.id = @id',
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
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources[0],
  }
}

export default httpTrigger
